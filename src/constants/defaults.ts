// pw-educamos-notifier
// Copyright (C) 2025 Daniel García García
// dev {at} danigarcia.org

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

const defaults = {
  baseUrl: "https://educamosclm.castillalamancha.es",
  endpoints: {
    messages: "/back/comunicaciones/mensajes/recibidos",
    messagesQuery:
      "?page=#&numItems=50&idColectivo=-1&leido=N&anno=&historico=false",
    messageDetails: "/back/comunicaciones/mensajes/#?enviado=false",
    attachment: "/back/comunicaciones/mensajes/adjunto/#",
    leido: "/back/comunicaciones/mensaje/leido/#",
  },
  pages: {
    inbox: "/s/messages",
    login: "/accesoeducamos/"
  },
  browserConfig: {
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:139.0) Gecko/20100101 Firefox/139.0",
  },
  cookieNames: {
    keycloackIdentity: "KEYCLOAK_IDENTITY",
  },
  headers: {
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:139.0) Gecko/20100101 Firefox/139.0",
    accept: "application/json, text/plain, */*",
    "accept-language": "es-ES,es;q=0.8,en;q=0.6,en-US;q=0.4,ca;q=0.2",
    "accept-encoding": "gzip, deflate, br, zstd",
    referer: "https://educamosclm.castillalamancha.es/s/messages",
    origin: "https://educamosclm.castillalamancha.es",
    dnt: "1",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    connection: "keep-alive",
  },
  maxContentLength: 6000000,
};

export default defaults;
