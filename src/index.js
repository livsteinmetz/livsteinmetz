import React from 'react'
import ReactDOM from 'react-dom'
import Liv from './components/Liv/Liv'
import './styles/index.scss'
import firebase from 'firebase/app'
import { FIREBASE_CONFIG } from './constants'

firebase.initializeApp(FIREBASE_CONFIG)
ReactDOM.render(<Liv />, document.getElementById('root'))
