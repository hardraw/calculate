
import { useState, useEffect } from 'react';
import './App.css'
import car from './assets/renault-sandero.png';
import axios from 'axios';
import vehiclesPvp from './vehiclesPvp.json';


export default function CarExpensesCalculator() {
  const [precioAuto, setPrecioAuto] = useState('');
  const [plazoMes, setPlazoMes] = useState(48);
  const [cuotaMensual, setCuotaMensual] = useState('');
  const [intMensual, setInteresMensual] = useState(2.2);
  const [todoRiesgo, setTodoRiesgo] = useState('');
  const [soat, setSoat] = useState(0);
  const [matricula, setMatricula] = useState('');
  const [revisiones, setRevisiones] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idAll, setIdAll] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [bodyMonthly, setMonthly] = useState([]);
  const [resultPrice, setResultPrice] = useState([]);
  const apiUrl = 'https://dev-cms.rentingtuio.com.co/api/vcs-vehiculos?populate=type&populate=Caract.characteristic&populate=main_image';
  const priceApiUrl = 'https://vcs.rentingtuio.com.co/api/cotizador'

  const handleSubmit = (e) => {
    e.preventDefault();

    const total = parseInt((Number(cuotaMensual)) + (Number(todoRiesgo) / 12) + (Number(soat) / 12) + (Number(matricula) / 12) + (Number(revisiones) / 12));
    setTotalCost(isNaN(total) ? 0 : total);
  };

  useEffect(() => {
    // Calcular la cuota mensual y actualizar el estado cada vez que cambien los valores de precioAuto, plazoMes o intMensual
    const calcularCuotaMensual = () => {
      const tasaInteres = intMensual / 100;
      //const capital = parseFloat(precioAuto.replace(/,/g, '')); // Remover comas de miles y convertir a número
      const capital = precioAuto
      const meses = parseInt(plazoMes);
      setTodoRiesgo(((precioAuto * 0.035)).toFixed(0))
      setSoat(622000)
      setMatricula(485000)
      setRevisiones((precioAuto * 0.05) * 4)
      const cuota =
        (capital * tasaInteres * Math.pow(1 + tasaInteres, meses)) /
        (Math.pow(1 + tasaInteres, meses) - 1);
      setCuotaMensual(cuota.toFixed(0)); // Redondear a dos decimales y actualizar el estado
    };

    calcularCuotaMensual();
  }, [precioAuto, plazoMes, intMensual]);

  useEffect(() => {
    axios.get(apiUrl)
      .then((response) => {
        setVehicles(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    if (!vehicles || vehicles.length === 0) return;
    setMarcas(marcasNew);
    setIdAll(vehicleIdNew);
  }, [vehicles]);

  useEffect(() => {
    if (idAll.length === 0) return;
    setMonthly({
      "kilometros": 10000,
      "meses": 48,
      "pyp": false,
      "ids": idAll.map(id => parseInt(id, 10))
    });
  }, [idAll]);

  useEffect(() => {
    postPricesMonthly(priceApiUrl, bodyMonthly)
      .then(result => setResultPrice(result))

  }, [bodyMonthly]);

  const postPricesMonthly = async (priceUrl, data) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
      };
      const response = await axios.post(priceUrl, JSON.stringify(data), config);
      return response.data;
    } catch (error) {
      console.log(error, 'error api')
    }
  };

  if (vehicles && vehicles.length > 0) {
    var marcasNew = Array.from(new Set(vehicles.map(function (vehicle) {
      return vehicle.attributes.Marca;
    }).filter((value, index, self) => self.indexOf(value) === index)));
    var vehicleIdNew = Array.from(new Set(vehicles.map(function (vehicle) {
      return vehicle.attributes.ID_propio;
    }).filter((value, index, self) => self.indexOf(value) === index)));
  }

  if (resultPrice.length > 0) {
    vehicles?.map(function (vehicle) {
      resultPrice.forEach(function (item) {
        if (vehicle.attributes.ID_propio === item.id.toString()) {
          vehicle.attributes.priceNormal = item.price;
          //agregar el valor del vehiculo real de precio venta al publico.
        }
      });
      vehiclesPvp.forEach(function (item){
        if (vehicle.attributes.ID_propio === item.ID_propio) {
          vehicle.attributes.pricePvp = item.valorPVP;
        }
      })
    });
  }

  return (
    <div className="row col-2 gap-30">
      <div className='container'>
        <h1>Calculadora de gastos de vehículo</h1>
        <form onSubmit={handleSubmit}>
          <div className="row col-2 gap-10">
            <label>
              Valor del vehículo
              <input type="text" value={precioAuto} onChange={(e) => {
                setPrecioAuto(e.target.value);
              }} />
            </label>
            <label>
              Meses:
              <input type="text" value={plazoMes} onChange={(e) => {
                setPlazoMes(e.target.value);
              }} />
            </label>

          </div>
          <div className="row col-2 gap-10">
            <label>
              Cuota mensual con banco:
              <input type="text" value={isNaN(cuotaMensual) ? 0 : cuotaMensual} onChange={(e) => calcCuota()} readyOnly />
            </label>
            <label>
              Interés mensual:
              <input type="text" value={intMensual} onChange={(e) => setInteresMensual(e.target.value)} />
            </label>
          </div>
          <div className="row col-2 gap-10">
            <label>
              Seguro Todo riesgo:
              <input type="text" value={todoRiesgo} onChange={(e) => setTodoRiesgo(e.target.value)} />
            </label>
            <label>
              SOAT:
              <input type="text" value={soat} onChange={(e) => setSoat(e.target.value)} />
            </label>
          </div>

          <div className="row col-2 gap-10">
            <label>
              Matrícula:
              <input type="text" value={matricula} onChange={(e) => setMatricula(e.target.value)} />
            </label>
            <label>
              Revisiones Técnicas:
              <input type="text" value={revisiones} onChange={(e) => setRevisiones(e.target.value)} />
            </label>
          </div>


          <div className="row">
            <button type="submit">Calcular</button>
          </div>
        </form>

        <div className="row col-2 gap-10 block-totals">
          <div className="block">
            <p>Costo mantenimiento Mensual de tu carro:  </p>
            <h3>{totalCost.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</h3>
          </div>

          <div className="block">
            <p>Costo total por los {plazoMes} meses que demoraste pagando el crédito del carro:  </p>
            <h3>{(totalCost * plazoMes).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</h3>
          </div>
        </div>

        <div className="row">
          <small>Nota: Los valores anteriores son estimativos, y de consumo mensual, pueden variar de acuerdo al precio del vehículo o al perfil crediticio que tengas en el momento.</small>
        </div>


      </div>
      <div className="row">
        <div className="container">
          <h1>Suscripción mensual con Renting TUIO</h1>

          <form action="">
            <select name="" id="" onChange={(e) => setSelectedVehicle(vehicles.find(v => v.attributes.ID_propio === e.target.value),  setPrecioAuto(selectedVehicle?.attributes?.pricePvp ?? ""))}>
              {vehicles.map((vehicle, index) => (
                <option key={index} value={vehicle.attributes.ID_propio}>
                  {vehicle?.attributes?.Marca + ' ' + vehicle?.attributes?.Modelo + ' ' + vehicle?.attributes?.Referencia}
                </option>
              ))}
            </select>
          </form>
          {selectedVehicle && (
            <div className="block">
              <h2>{selectedVehicle?.attributes?.Marca + ' ' + selectedVehicle?.attributes?.Modelo + ' ' + selectedVehicle?.attributes?.Referencia}</h2>
              <img src={selectedVehicle?.attributes?.main_image?.data?.attributes?.formats?.small?.url} alt="" />
              <div className="block-bg">
                <h2>Valor suscripción por 48 meses</h2>
                <h3>$ {selectedVehicle?.attributes?.priceNormal.toLocaleString()} IVA incluido</h3>
                <p>costo total por 48 meses con suscripción y 10.000 kilometros:</p>
                <p>$ {(selectedVehicle?.attributes?.priceNormal * 48).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
