import { Panel } from './ui';

const ROWS = [
  [['↑', '↓', '←', '→'], 'Cambiar de dirección'],
  [['W', 'A', 'S', 'D'], 'Alternativa para moverse'],
  [['Esc'], 'Pausar / reanudar (en menús: volver)'],
  [['Enter'], 'Confirmar la opción seleccionada'],
  [['R'], 'Reiniciar la partida (pide confirmación)'],
  [['M'], 'Activar o desactivar el sonido'],
];

export default function ControlsScreen({ onBack }) {
  return (
    <Panel title="Controles" subtitle="Las flechas siempre se refieren a la pantalla." onBack={onBack}>
      <ul className="dg-controls">
        {ROWS.map(([keys, text]) => (
          <li key={text}>
            <span className="dg-controls__keys">
              {keys.map((k) => (
                <kbd key={k}>{k}</kbd>
              ))}
            </span>
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <h3 className="dg-subhead">Pantallas táctiles</h3>
      <p className="dg-text">
        Durante la partida aparece una cruceta con cuatro botones grandes. También puedes deslizar el dedo sobre el
        tablero. En pantallas verticales la vista gira para que el tablero se vea más grande.
      </p>
      <h3 className="dg-subhead">Reglas</h3>
      <p className="dg-text">
        Cada hueso (10 pts) o galleta (25 pts) cuenta como premio y alarga al perro. No puedes girar en sentido
        contrario. Chocar con el borde, un obstáculo o tu propio cuerpo termina la partida.
      </p>
    </Panel>
  );
}
