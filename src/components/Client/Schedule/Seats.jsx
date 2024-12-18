import React, { useEffect, useState } from "react";
import { firestore } from "../../../utils/firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  getDoc,
  writeBatch,
} from "firebase/firestore";
import { useSearchParams, Link } from "react-router-dom"; // Importa Link de react-router-dom
import { createSession } from "../../BackEnd/src/controllers/payment.controllers.js";

export const SeatBooking = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [ticketPrice, setTicketPrice] = useState(10);
  const [totalPrice, setTotalPrice] = useState("");
  const [selectedSeatsCount, setSelectedSeatsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [asientos, setAsientos] = useState([]);
  const [selectedMovieIndex, setSelectedMovieIndex] = useState(0);
  const [parentDocumentId, setParentDocumentId] = useState(null);

  const [loader, setLoader] = useState(true);

  const [searchParams] = useSearchParams();
  const [movieDetails, setMovieDetails] = useState(null);

  useEffect(() => {
    const asyncLoader = async () => {
      setLoader(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLoader(false);
    };

    asyncLoader();
  }, []);

  useEffect(() => {
    const getMovieData = async (movie_id) => {
      const docRef = doc(firestore, "movies", movie_id);
      const docSnap = await getDoc(docRef);
      const infoMovie = docSnap.data();
      setMovieDetails(infoMovie);
      const moviePrice = infoMovie.price;
      setTicketPrice(moviePrice);
    };

    getMovieData(selectedMovieIndex.toString());
  }, [selectedMovieIndex]);

  useEffect(() => {
    setSelectedMovieIndex(searchParams.get("id") || 0);
    const totalPrice = ticketPrice * selectedSeatsCount;
    setTotalPrice(totalPrice);
  }, [selectedSeatsCount, ticketPrice]);

  useEffect(() => {
    const unsubscribe = populateUI(); // Llama a populateUI() cuando el componente se monta

    return () => {
      unsubscribe(); // Cancela el observador cuando el componente se desmonta
    };
  }, []);

  const sendSelectedSeatsToFirebase = async () => {
    try {
      const batch = [];
      selectedSeats.forEach((seatId) => {
        const seatDocRef = doc(firestore, "seats", seatId);
        batch.push(setDoc(seatDocRef, { occupied: true }));
      });
      await Promise.all(batch);
      console.log("Asientos enviados correctamente a Firebase");
    } catch (error) {
      console.error(
        "Error al enviar los asientos seleccionados a Firebase:",
        error
      );
    }
  };

  const handleSeatClick = (e, seatId) => {
    if (!e.target.classList.contains("occupied")) {
      e.target.classList.toggle("selected");
      updateSelectedCount(seatId);
    }
  };

  const updateSelectedCount = (seatId) => {
    const updatedSelectedSeats = [...selectedSeats];
    const seatIndex = updatedSelectedSeats.indexOf(seatId);
    if (seatIndex !== -1) {
      updatedSelectedSeats.splice(seatIndex, 1);
    } else {
      updatedSelectedSeats.push(seatId);
    }
    setSelectedSeats(updatedSelectedSeats);
    setSelectedSeatsCount(updatedSelectedSeats.length);
  };

  const populateUI = () => {
    try {
      const seatCollectionRef = collection(firestore, "seats");
      const unsubscribe = onSnapshot(seatCollectionRef, (querySnapshot) => {
        const asientosData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const estado = data.occupied;
          const id = doc.id;

          asientosData.push({
            id: id,
            estado: estado,
            ...data,
          });
        });

        setAsientos(asientosData);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error obteniendo asientos: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    applyOccupiedStyles(); // Aplica los estilos para los asientos ocupados después de cargar los datos
  }, [asientos]);

  const applyOccupiedStyles = () => {
    const occupiedSeats = document.querySelectorAll(".seat");
    occupiedSeats.forEach((seat) => {
      const seatId = seat.dataset.seatId;
      const seatData = asientos.find((asiento) => asiento.id === seatId);
      if (seatData && seatData.estado) {
        seat.classList.add("occupied");
        // console.log("sijala")
      }
    });
  };

  const handleSend = async () => {
    if (selectedSeats.length > 0) {
      try {
        await sendSelectedSeatsToFirebase(); // Llama a la función existente para enviar los asientos a Firebase
        // alert("Asientos agregados correctamente.");
      } catch (error) {
        console.error("Error al enviar los asientos: ", error);
        alert(
          "Hubo un error al agregar los asientos. Por favor, inténtalo de nuevo."
        );
      }
    } else {
      alert("No hay asientos seleccionados para agregar.");
    }
  };

  return (
    <div className="flex gap-8">
      <div className="">
        <div className="container">
          <ul className="showcase">
            <li>
              <div className="seat"></div>
              <small>N/A</small>
            </li>
            <li>
              <div className="seat selected"></div>
              <small>Selected</small>
            </li>
            <li>
              <div className="seat occupied"></div>
              <small>Occupied</small>
            </li>
          </ul>

          <div className="screen"></div>
          <div className="row">
            <div
              className="seat"
              data-seat-id="seat1"
              onClick={(e) => handleSeatClick(e, "seat1")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat2"
              onClick={(e) => handleSeatClick(e, "seat2")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat3"
              onClick={(e) => handleSeatClick(e, "seat3")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat4"
              onClick={(e) => handleSeatClick(e, "seat4")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat5"
              onClick={(e) => handleSeatClick(e, "seat5")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat6"
              onClick={(e) => handleSeatClick(e, "seat6")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat7"
              onClick={(e) => handleSeatClick(e, "seat7")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat8"
              onClick={(e) => handleSeatClick(e, "seat8")}
            ></div>
          </div>
          <div className="row">
            <div
              className="seat"
              data-seat-id="seat9"
              onClick={(e) => handleSeatClick(e, "seat9")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat10"
              onClick={(e) => handleSeatClick(e, "seat10")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat11"
              onClick={(e) => handleSeatClick(e, "seat11")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat12"
              onClick={(e) => handleSeatClick(e, "seat12")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat13"
              onClick={(e) => handleSeatClick(e, "seat13")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat14"
              onClick={(e) => handleSeatClick(e, "seat14")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat15"
              onClick={(e) => handleSeatClick(e, "seat15")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat16"
              onClick={(e) => handleSeatClick(e, "seat16")}
            ></div>
          </div>
          <div className="row">
            <div
              className="seat"
              data-seat-id="seat17"
              onClick={(e) => handleSeatClick(e, "seat17")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat18"
              onClick={(e) => handleSeatClick(e, "seat18")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat19"
              onClick={(e) => handleSeatClick(e, "seat19")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat20"
              onClick={(e) => handleSeatClick(e, "seat20")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat21"
              onClick={(e) => handleSeatClick(e, "seat21")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat22"
              onClick={(e) => handleSeatClick(e, "seat22")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat23"
              onClick={(e) => handleSeatClick(e, "seat23")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat24"
              onClick={(e) => handleSeatClick(e, "seat24")}
            ></div>
          </div>
          <div className="row">
            <div
              className="seat"
              data-seat-id="seat25"
              onClick={(e) => handleSeatClick(e, "seat25")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat26"
              onClick={(e) => handleSeatClick(e, "seat26")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat27"
              onClick={(e) => handleSeatClick(e, "seat27")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat28"
              onClick={(e) => handleSeatClick(e, "seat28")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat29"
              onClick={(e) => handleSeatClick(e, "seat29")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat30"
              onClick={(e) => handleSeatClick(e, "seat30")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat31"
              onClick={(e) => handleSeatClick(e, "seat31")}
            ></div>
            <div
              className="seat"
              data-seat-id="seat32"
              onClick={(e) => handleSeatClick(e, "seat32")}
            ></div>
          </div>

          {/* Add other rows here */}

          {/* <button onClick={sendSelectedSeatsToFirebase}>Enviar asientos</button>   */}
        </div>
      </div>
      <div>
        <div className="contenidoCheckOut bg-black rounded-xl mt-4 mx-4 md:w-auto flex flex-col   items-center justify-center">
          <div className="innerCheckOut mt-4 m-4 md:flex md:items-center">
            <img
              className="moviePictureCheckOut w-40 p-2"
              src={movieDetails?.img_url}
            />
            <div className="box mt-4 md:mt-0 md:ml-4">
              <h3 className="uppercase text-white text-2xl font-medium lemon-milk mt-4 md:mt-0">
                CheckOut
              </h3>
              <div>
                <div className="flex flex-col">
                  <div className="flex justify-between">
                    <div>
                      <div>
                        <p className="text-blue-300">Total:</p>
                        <p className="text-blue-300">Hora:</p>
                        <p className="text-blue-300">Asientos:</p>
                      </div>
                    </div>
                    <div className="text-white">
                      <div>${totalPrice}</div>
                      <div>{movieDetails?.schedule}</div>
                      <div>{selectedSeatsCount}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className=" text-white">
            <div className="m-4 text-white">
              <div>{movieDetails?.title}</div>
              <div>{movieDetails?.duration} minutos</div>
              {/* Cambiamos <a> por <Link> */}
              <Link
                className="bg-[color:var(--negro)] text-white rounded-xl px-8 py-1 uppercase text-sm lemon-milk hover:bg-white hover:text-[color:var(--negro)] transition-all duration-1000"
                onClick={() =>
                  createSession(
                    selectedMovieIndex,
                    movieDetails?.title,
                    movieDetails?.duration,
                    totalPrice * 100
                  ).then(
                    (data) => {
                      handleSend();
                      window.location = data.url;
                    } //window.open(data.url)
                  )
                }
                // Pasamos los datos de la película seleccionada como parámetros en la URL
                //to={`/payment?id=${selectedMovieIndex}&title=${encodeURIComponent(movieDetails?.title)}&duration=${movieDetails?.duration}&price=${totalPrice}`}
              >
                Pay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatBooking;
