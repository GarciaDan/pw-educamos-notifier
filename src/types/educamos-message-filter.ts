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

export type EducamosMessageFilter = {
    id?: number;
    idDestinatarioMensaje?: number;
    asunto?: string;
    idRemitente?: number;
    remitente?: string;
    idGrupo?: number;
    grupo?: string;
    destinatarios?: string;
    respuesta?: boolean;
    fechaMensaje?: string;
    leido?: boolean;
    adjuntos?: boolean;
    respondido?: boolean;
    numeroDestinatarios?: number;
    numeroLeidos?: number;
    borradoParaTodos?: boolean;
  };
  