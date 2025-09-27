import { createRoot } from 'react-dom/client';

import Liv from './components/Liv/Liv';

import './styles/index.scss';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Liv />);
