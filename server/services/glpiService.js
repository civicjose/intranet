// server/services/glpiService.js
const axios = require('axios');

const { GLPI_API_URL, GLPI_APP_TOKEN, GLPI_USER_TOKEN } = process.env;

let sessionToken = null;

async function initSession() {
  const url = `${GLPI_API_URL}/initSession`;
  try {
    const response = await axios.get(url, {
      headers: { 'App-Token': GLPI_APP_TOKEN },
      params: { 'user_token': GLPI_USER_TOKEN }
    });
    if (response.data?.session_token) {
      sessionToken = response.data.session_token;
      console.log("✅ (LOG) Sesión con GLPI iniciada correctamente.");
      return sessionToken;
    }
    throw new Error("La respuesta de GLPI no contiene un session_token.");
  } catch (error) {
    sessionToken = null;
    const status = error.response ? error.response.status : 'N/A';
    const data = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error(`❌ (LOG) Error fatal al iniciar sesión en GLPI (Status: ${status}): ${data}`);
    throw new Error(`Fallo en la conexión con GLPI. Status: ${status}`);
  }
}

async function glpiRequest(requestFunction) {
  try {
    if (!sessionToken) await initSession();
    return await requestFunction(sessionToken);
  } catch (error) {
    const isInvalidToken = (Array.isArray(error.response?.data) && error.response.data[0] === 'ERROR_SESSION_TOKEN_INVALID');
    if (isInvalidToken) {
      console.warn("⚠️ (LOG) Token de sesión de GLPI inválido. Refrescando y reintentando...");
      await initSession();
      return await requestFunction(sessionToken);
    }
    throw error;
  }
}

const getUserIdByEmail = (email) => glpiRequest(async (token) => {
  const searchUrl = `${GLPI_API_URL}/search/User`;
  const response = await axios.get(searchUrl, {
    headers: { 'App-Token': GLPI_APP_TOKEN },
    params: {
      'session_token': token,
      'criteria[0][field]': '5',
      'criteria[0][searchtype]': 'contains',
      'criteria[0][value]': email,
      'forcedisplay[0]': '2'
    }
  });

  const data = response.data?.data || [];
  if (data.length > 0) {
    const userId = data[0]["2"];
    return userId;
  }
  return null;
});

exports.getUserTickets = (userEmail) => glpiRequest(async (token) => {
  const userId = await getUserIdByEmail(userEmail);
  if (!userId) return [];

  const response = await axios.get(`${GLPI_API_URL}/search/Ticket`, {
    headers: { 'App-Token': GLPI_APP_TOKEN, 'Session-Token': token },
    params: {
      'is_deleted': '0',
      'criteria[0][link]': 'AND',
      'criteria[0][field]': '4',
      'criteria[0][searchtype]': 'equals',
      'criteria[0][value]': userId,
      'criteria[1][link]': 'AND NOT',
      'criteria[1][field]': '12',
      'criteria[1][searchtype]': 'equals',
      'criteria[1][value]': '6',
      'forcedisplay[0]': '2', 'forcedisplay[1]': '1', 'forcedisplay[2]': '12', 'forcedisplay[3]': '15',
      'order': 'DESC',
      'range': '0-999',
      'is_recursive': '1'
    }
  });
  
  const rawTickets = response.data?.data || [];

  return rawTickets.map(ticket => ({
    id: ticket["2"],
    name: ticket["1"],
    status: ticket["12"],
    date_creation: ticket["15"],
  }));
});

exports.getTicketDetails = (ticketId) => glpiRequest(async (token) => {
  const [ticketResponse, followupsResponse] = await Promise.all([
    axios.get(`${GLPI_API_URL}/Ticket/${ticketId}`, { headers: { 'App-Token': GLPI_APP_TOKEN, 'Session-Token': token } }),
    axios.get(`${GLPI_API_URL}/Ticket/${ticketId}/TicketFollowup`, { headers: { 'App-Token': GLPI_APP_TOKEN, 'Session-Token': token } })
  ]);
  
  // --- FILTRO PARA SEGUIMIENTOS PÚBLICOS ---
  const publicFollowups = followupsResponse.data.filter(followup => followup.is_private === 0);

  return { 
    details: ticketResponse.data, 
    followups: publicFollowups // Devolvemos solo los públicos
  };
});

exports.createTicket = (userEmail, { title, content }) => glpiRequest(async (token) => {
  const userId = await getUserIdByEmail(userEmail);
  if (!userId) throw new Error("No se puede crear el ticket porque el usuario no existe en GLPI.");

  const response = await axios.post(`${GLPI_API_URL}/Ticket`, {
    input: {
      name: title,
      content: content,
      type: 2,
      _users_id_requester: userId,
    }
  }, {
    headers: { 'App-Token': GLPI_APP_TOKEN, 'Session-Token': token }
  });
  return response.data;
});