import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const TabelaReservas = ({ reservas, aoEditar, aoRemover }) => (
  <table className="table">
    <tbody>
      {reservas.map((reserva) => (
        <tr key={reserva.id}>
          <td>{reserva.sala}</td>
          <td>{reserva.dataHora}</td>
          <td>
            <button className="editButton" onClick={() => aoEditar(reserva)}>
              Editar
            </button>
            <button
              className="removeButton"
              onClick={() => aoRemover(reserva.id)}
            >
              Remover
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const FormularioReserva = ({
  sala,
  dataHora,
  aoAlterarSala,
  aoAlterarDataHora,
  aoEnviar,
  aoCancelar,
  estaAtualizando,
}) => (
  <div className="form">
    <label>Sala: </label>
    <input type="text" value={sala} onChange={aoAlterarSala} />
    <label>Data e Hora: </label>
    <input
      type="datetime-local"
      value={dataHora}
      onChange={aoAlterarDataHora}
    />
    <button
      className={`addButton ${estaAtualizando ? "updateButton" : ""}`}
      onClick={aoEnviar}
    >
      {estaAtualizando ? "Atualizar" : "Agendar"}
    </button>
    <button className="cancelButton" onClick={aoCancelar}>
      Cancelar
    </button>
  </div>
);

const App = () => {
  const apiURL = "http://localhost:8080";
  const [reservas, setReservas] = useState([]);
  const [erro, setErro] = useState(null);

  const [novaReserva, setNovaReserva] = useState({
    sala: "",
    dataHora: "",
  });
  const [reservaSelecionada, setReservaSelecionada] = useState(null);

  const buscarReservas = async () => {
    try {
      const resposta = await axios.get(`${apiURL}/reservations`);
      setReservas(resposta.data);
      setErro("");
    } catch (erro) {
      setErro("Erro ao buscar reservas: " + erro.message);
    }
  };

  useEffect(() => {
    buscarReservas();
  }, []);

  const adicionarOuAtualizarReserva = async () => {
    try {
      const { sala, dataHora } = novaReserva;
      const reservaFormatada = {
        sala,
        dataHora,
      };

      if (reservaSelecionada) {
        await axios.put(
          `${apiURL}/reservations/${reservaSelecionada.id}`,
          reservaFormatada
        );
      } else {
        await axios.post(`${apiURL}/reservations`, reservaFormatada);
      }

      setReservaSelecionada(null);
      setNovaReserva({ sala: "", dataHora: "" });
      buscarReservas();
      setErro("");
    } catch (erro) {
      setErro(`Erro ao adicionar/editar reserva: ${erro.message}`);
    }
  };

  const cancelarAtualizacao = () => {
    setReservaSelecionada(null);
    setNovaReserva({ sala: "", dataHora: "" });
  };

  const editarReserva = (reserva) => {
    setReservaSelecionada(reserva);
    setNovaReserva({
      sala: reserva.sala,
      dataHora: reserva.dataHora,
    });
  };

  const removerReserva = async (id) => {
    try {
      await axios.delete(`${apiURL}/reservations/${id}`);
      buscarReservas();
      setErro("");
    } catch (erro) {
      setErro(`Erro ao remover reserva: ${erro.message}`);
    }
  };

  return (
    <div className="container">
      <img src="/ifpi.jpg" alt="Logo IFPI" className="logo" />
      <h1>Agendamento de Laboratórios e Salas de Reuniões</h1>
      {erro && <p className="error">{erro}</p>}
      <TabelaReservas
        reservas={reservas}
        aoEditar={editarReserva}
        aoRemover={removerReserva}
      />
      <h2>Agendar/Editar Reserva</h2>
      <FormularioReserva
        sala={novaReserva.sala}
        dataHora={novaReserva.dataHora}
        aoAlterarSala={(e) =>
          setNovaReserva({ ...novaReserva, sala: e.target.value })
        }
        aoAlterarDataHora={(e) =>
          setNovaReserva({ ...novaReserva, dataHora: e.target.value })
        }
        aoEnviar={adicionarOuAtualizarReserva}
        aoCancelar={cancelarAtualizacao}
        estaAtualizando={reservaSelecionada !== null}
      />
    </div>
  );
};

export default App;
