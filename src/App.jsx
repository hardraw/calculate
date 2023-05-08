
import { useState, useEffect } from 'react';
import './App.css'
import car from './assets/renault-sandero.png';
import axios from 'axios';
import vehiclesPvp from './vehiclesPvp.json';


export default function CarExpensesCalculator() {
  const [precioAuto, setPrecioAuto] = useState('');
  const [plazoMes, setPlazoMes] = useState(48);
  const [cuotaMensual, setCuotaMensual] = useState(0);
  const [intMensual, setInteresMensual] = useState(2.2);
  const [todoRiesgo, setTodoRiesgo] = useState(0);
  const [soat, setSoat] = useState(0);
  const [matricula, setMatricula] = useState('');
  const [revisiones, setRevisiones] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesPrice, setVehiclesPrice] = useState([]);
  const [loading, setLoading] = useState(false);
  const [idAll, setIdAll] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [bodyMonthly, setMonthly] = useState([]);
  const [resultPrice, setResultPrice] = useState([]);
  const apiUrl = 'https://dev-cms.rentingtuio.com.co/api/vcs-vehiculos?populate=type&populate=Caract.characteristic&populate=main_image';
  const priceApiUrl = 'https://vcs.rentingtuio.com.co/api/cotizador';
  const vehiclesPriceUrl = 'https://dev-vcs.rentingtuio.com.co/api/cars?populate=*'



  useEffect(() => {
    // Calcular la cuota mensual y actualizar el estado cada vez que cambien los valores de precioAuto, plazoMes o intMensual
    const calcularCuotaMensual = () => {
      const tasaInteres = intMensual / 100;
      //const capital = parseFloat(precioAuto.replace(/,/g, '')); // Remover comas de miles y convertir a número
      const capital = precioAuto
      const meses = parseInt(plazoMes);
      setTodoRiesgo(((precioAuto * 0.03)).toFixed(0))
      setSoat(622000)
      setMatricula(750000)
      setRevisiones(((precioAuto * 0.05) / 4) / 12)
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
        const selectedVehicle2 = vehicles.find(v => v.attributes.ID_propio === '435');
        setSelectedVehicle(selectedVehicle2)
      })
      .catch((error) => {
        console.error(error);
      });
    axios.get(vehiclesPriceUrl)
      .then((response) => {
        setVehiclesPrice(response.data.data)
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    if (!vehicles || vehicles.length === 0) return;
    setMarcas(marcasNew);
    setIdAll(vehicleIdNew);
    //setLoading(true);
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

      setPrecioAuto(selectedVehicle?.attributes?.pricePvp ?? "");
      const tasaInteres = intMensual / 100;
      const meses = parseInt(plazoMes);
      const cuota =
        (selectedVehicle?.attributes?.pricePvp * tasaInteres * Math.pow(1 + tasaInteres, meses)) /
        (Math.pow(1 + tasaInteres, meses) - 1);
      const total = parseInt((Number(cuota)) + (Number(((selectedVehicle?.attributes?.pricePvp * 0.03)).toFixed(0)) / 12) + (Number(soat) / 12) + (Number(matricula) / 12) + (Number((selectedVehicle?.attributes?.pricePvp * 0.05) * 4) / 12));
      setTotalCost(isNaN(total) ? 0 : total);
  }, [bodyMonthly]);

  // useEffect(() => {
  //   // console.log(selectedVehicle , 'selectedVehicle before if')
  //   if(selectedVehicle != undefined && selectedVehicle != ''){
  //     //console.log(selectedVehicle, 'selectedVehicle')
  //     //const selectedVehicle2 = vehicles.find(v => v.attributes.ID_propio === '435');
  //     //console.log(selectedVehicle2 , 'selectedVehicle2')
  //     //setSelectedVehicle(selectedVehicle2);
  //     //setLoading(true);
  //     //console.log(selectedVehicle2, 'selectedVehicle2')
  //     //handleVehicleChange({target: {value: selectedVehicle2?.attributes?.ID_propio}});
  //     //handleVehicleChange({target: {value: selectedVehicle2}});
  //   }
  // }, [selectedVehicle]);

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
        }
      });
      vehiclesPvp.forEach(function (item) {
        if (vehicle.attributes.ID_propio === item.ID_propio) {
          vehicle.attributes.pricePvp = item.valorPVP;
        }
      })
      // vehiclesPrice.forEach(function (item){
      //   if (vehicle.attributes.ID_propio === item.attributes.internal_code) {
      //     vehicle.attributes.pricePvp = item.attributes.PVC;
      //     vehicle.attributes.typeVehicle = item.attributes.Type.Type;
      //     vehicle.attributes.Cilindraje = item.attributes.datasheet[0].cilindraje;
      //   }
      // })
    });
  }

  const handleVehicleChange = (e) => {
    e.preventDefault();
    const selectedVehicle = vehicles.find(v => v.attributes.ID_propio === e.target.value);
    setSelectedVehicle(selectedVehicle);
    setPrecioAuto(selectedVehicle?.attributes?.pricePvp ?? "");
    const tasaInteres = intMensual / 100;
    const meses = parseInt(plazoMes);
    const cuota =
      (selectedVehicle?.attributes?.pricePvp * tasaInteres * Math.pow(1 + tasaInteres, meses)) /
      (Math.pow(1 + tasaInteres, meses) - 1);
    const total = parseInt((Number(cuota)) + (Number(((selectedVehicle?.attributes?.pricePvp * 0.03)).toFixed(0)) / 12) + (Number(soat) / 12) + (Number(matricula) / 12) + (Number((selectedVehicle?.attributes?.pricePvp * 0.05) / 4) / 12));
    setTotalCost(isNaN(total) ? 0 : total);
  }

  const calculateTotalCost = () => {
    const total = parseInt((Number(cuotaMensual)) + (Number(todoRiesgo) / 12) + (Number(soat) / 12) + (Number(matricula) / 12) + (Number(revisiones) / 4));
    setTotalCost(isNaN(total) ? 0 : total);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateTotalCost();
  };

  return (
    <>
      <div className="row col-2 gap-30">
        <div className='container'>
          <h1>Calculadora de gastos de vehículo</h1>
          <form onSubmit={handleSubmit}>
            <div className="row col-2 gap-10">
              <label>
                Valor del vehículo
                <input type="text" value={precioAuto.toLocaleString()} readOnly={true} style={{ cursor: 'not-allowed' }} onChange={(e) => {
                  setPrecioAuto(e.target.value);
                }} />
              </label>
              <label>
                Meses:
                <input type="text" style={{ background: '#EEF5FF' }} value={plazoMes} onChange={(e) => {
                  setPlazoMes(e.target.value);
                }} />
              </label>

            </div>
            <div className="row col-2 gap-10">
              <label>
                Cuota mensual con banco:
                <input type="text" style={{ background: '#EEF5FF' }} value={isNaN(cuotaMensual) ? 0 : parseInt(cuotaMensual).toLocaleString()} onChange={(e) => calcCuota()} readyOnly />
              </label>
              <label>
                Interés mensual:
                <input type="text" style={{ background: '#EEF5FF' }} value={intMensual} onChange={(e) => setInteresMensual(e.target.value)} />
              </label>
            </div>
            <div className="row col-2 gap-10">
              <label>
                Seguro Todo riesgo:
                <input type="text" value={parseInt(todoRiesgo).toLocaleString()} readOnly={true} style={{ cursor: 'not-allowed' }} onChange={(e) => setTodoRiesgo(e.target.value)} />
              </label>
              <label>
                SOAT:
                <input type="text" value={soat.toLocaleString()} readOnly={true} style={{ cursor: 'not-allowed' }} onChange={(e) => setSoat(e.target.value)} />
              </label>
            </div>
            <div className="row col-2 gap-10">
              <label>
                Matrícula:
                <input type="text" value={matricula.toLocaleString()} readOnly={true} style={{ cursor: 'not-allowed' }} onChange={(e) => setMatricula(e.target.value)} />
              </label>
              <label>
                Revisiones Técnicas:
                <input type="text" value={revisiones.toLocaleString()} readOnly={true} style={{ cursor: 'not-allowed' }} onChange={(e) => setRevisiones(e.target.value)} />
              </label>
            </div>


            <div className="row">
              <button type="submit">Calcular</button>
            </div>
          </form>
        </div>        
        <div className="container">
          <h1>Suscripción mensual con Renting TUIO</h1>

          <form action="">
            <select name="" id="" onChange={handleVehicleChange}>
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
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="row col-1 gap-30">
        <div className="container">
          {selectedVehicle && (
            <div className="block">
              <h2>{selectedVehicle?.attributes?.Marca + ' ' + selectedVehicle?.attributes?.Modelo + ' ' + selectedVehicle?.attributes?.Referencia} Comparativa:</h2>
              <div className='grid'>
                <div>
                  <p>Costo Mensual de tener tu vehículo con un credito tradicional:</p>
                  <h3>{totalCost.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</h3>
                </div>
                <div>
                  <p>Valor suscripción Tuio Mensual</p>
                  <h3>$ {selectedVehicle?.attributes?.priceNormal.toLocaleString()} IVA incluido</h3>
                </div>
                <div>
                  <p>Costo total por los {plazoMes} meses que demoraste pagando el crédito del vehículo:  </p>
                  <h3>{(totalCost * plazoMes).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</h3>
                </div>
                <div>
                  <p>costo total por 48 meses con suscripción y 10.000 kilometros:</p>
                  <h3>$ {(selectedVehicle?.attributes?.priceNormal * 48).toLocaleString()}</h3>
                </div>                
              </div>
              <div className="row">
                <small>Nota: Los valores anteriores son estimativos, y de consumo mensual, pueden variar de acuerdo al precio del vehículo o al perfil crediticio que tengas en el momento. Tambien no se aplican valores de depreciacion e impuestos anuales de acuerdo a tu secretaria de transito para tu credito tradicional</small>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
