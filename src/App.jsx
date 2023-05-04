
import { useState, useEffect } from 'react'; 
import './App.css'
import car from './assets/renault-sandero.png';

export default function CarExpensesCalculator() {
  const [precioAuto, setPrecioAuto] = useState('');
  const [plazoMes, setPlazoMes] = useState(60);
  const [cuotaMensual, setCuotaMensual] = useState('');
  const [intMensual, setInteresMensual] = useState(1.8);
  const [todoRiesgo, setTodoRiesgo] = useState('');
  const [soat, setSoat] = useState(0);
  const [matricula, setMatricula] = useState('');
  const [revisiones, setRevisiones] = useState('');
  const [totalCost, setTotalCost] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const total = parseInt((Number(cuotaMensual)) + (Number(todoRiesgo)/12) + (Number(soat)/12) + (Number(matricula)/12) + (Number(revisiones)/12));
    setTotalCost(isNaN(total) ? 0 : total);
  };

  useEffect(() => {
    // Calcular la cuota mensual y actualizar el estado cada vez que cambien los valores de precioAuto, plazoMes o intMensual
    const calcularCuotaMensual = () => {
      const tasaInteres = intMensual / 100;
      const capital = parseFloat(precioAuto.replace(/,/g, '')); // Remover comas de miles y convertir a número
      const meses = parseInt(plazoMes);
      const cuota =
        (capital * tasaInteres * Math.pow(1 + tasaInteres, meses)) /
        (Math.pow(1 + tasaInteres, meses) - 1);
      setCuotaMensual(cuota.toFixed(0)); // Redondear a dos decimales y actualizar el estado
    };

    calcularCuotaMensual();
  }, [precioAuto, plazoMes, intMensual]);



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
                <input type="text"  value={isNaN(cuotaMensual) ? 0 : cuotaMensual} onChange={(e) => calcCuota()} readyOnly />
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
            <select name="" id="">
              <option value="1">Sandero</option>
              <option value="2">Fiat Pulse Impetus</option>
            </select>            
          </form>

          <div className="block">
              <h2>RENAULT SANDERO ZEN</h2>
              <img src={car} alt="" />
              <div className="block-bg">
                <h2>Valor suscripción por 60 meses</h2>
                <h3>2.380.000 IVA incluido</h3>
                <p>costo total por 60 meses con suscripción:</p>
                <p>138,000,000</p>
              </div> 
              
            </div>
        </div>
      </div>
    </div>
    
  );
}
