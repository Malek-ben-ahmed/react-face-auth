import './Formulaire_login.css';
import { Link, useNavigate } from 'react-router-dom';
import './Formulaire_signup';
import * as faceapi from "face-api.js";
import { useState, useEffect, useRef } from 'react';
import db from './Firestore.js';
import { collection, getDocs } from "firebase/firestore";

function Formulaire_login() {
  const [descriptor, setDescriptor] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const videoRef = useRef();
  const navigate = useNavigate(); // Pour naviguer vers une autre page

  useEffect(() => {
    const MODEL_URL = "/models";
    const loadModels = async () => {
      try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
        console.log(" Models loaded");
        startVideo();
      } catch (err) {
        console.error("Error on loading models:", err);
      }
    };
    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          console.log(" Camera is active");
        }
      })
      .catch((err) => {
        console.error("Error to access camera :", err);
        alert("Unable to access the camera");
      });
  };

  const handleCapture = async (e) => {
    e.preventDefault();
    if (!modelsLoaded) {
      alert("The models are not loaded yet.");
      return;
    }
    const video = videoRef.current;
    if (!video) return;

    try {
      const detection = await faceapi
        .detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection && detection.descriptor) {
        setDescriptor(Array.from(detection.descriptor));
        console.log("face detected :", detection.descriptor);
      } else {
        alert("none face detected !");
      }
    } catch (err) {
      console.error("Error detection :", err);
    }
  };

  const searchUserByDescriptor = async (e) => {
    e.preventDefault(); // empêcher le rechargement de la page

    if (!descriptor) {
      alert("you should capture your face first.");
      return;
    }

    try {
      const usersRef = collection(db, "userdatabase");
      const snapshot = await getDocs(usersRef);

      let matchFound = false;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const descriptorInDb = data.descriptor;

        if (arraysAreEqual(descriptorInDb, descriptor)) {
          console.log("Match found :", doc.id);
          matchFound = true;
          navigate('/welcomepage');
        }
      });

      if (!matchFound) {
        alert("You should create an account first");
      }
    } catch (err) {
      console.error("User search error :", err);
    }
  };

  // Fonction pour comparer les vecteurs faciaux avec tolérance
  function arraysAreEqual(arr1, arr2, tolerance = 0.5) {
    if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
    let distance = 0;
    for (let i = 0; i < arr1.length; i++) {
      distance += (arr1[i] - arr2[i]) ** 2;
    }
    distance = Math.sqrt(distance);
    return distance < tolerance;
  }

  return (
    <div className='bloc'>
      <div className='login'>
        <h2 id='gobaltitle'>Login</h2>

        <form onSubmit={searchUserByDescriptor}>
          <h3 id="subtitle">Add your photo to login</h3>
          <video ref={videoRef} autoPlay muted width="180" height="200" />
          <button type="button" onClick={handleCapture} style={{ marginLeft: "-150px" }}>
            capture face
          </button>
          {descriptor && <p style={{ color: 'green' }}>Face captured successfully</p>}

          <br /><br />
          <Link to='/Formulaire_signup'>
            <h5 id="link">Don't have an account? Sign up</h5>
          </Link>

          <button type='submit' id='loginbutton'>Login</button>
        </form>
      </div>
    </div>
  );
}

export default Formulaire_login;
