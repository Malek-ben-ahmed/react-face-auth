import './formulaire_signup.css';
import * as faceapi from "face-api.js";
import { useState, useEffect, useRef } from 'react';
import db from './Firestore.js';
import { collection, addDoc } from "firebase/firestore";
import '@fortawesome/fontawesome-free/css/all.min.css';


function Formulaire_signup() {
  const [name, setname] = useState("");
  const [mail, setmail] = useState("");
  const [password, setpassword] = useState("");
  const [confpassword, setconfpassword] = useState("");
  const [descriptor, setDescriptor] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const videoRef = useRef();

  // Charger les modèles au démarrage
  useEffect(() => {
    const MODEL_URL = "/models";

    const loadModels = async () => {
      try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
        console.log("models loaded");
        startVideo();
      } catch (err) {
        console.error("Error on loading models", err);
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
          console.log("Camera is active");
        }
      })
      .catch((err) => {
        console.error("Error to access the camera :", err);
        alert("Unable to access the camera");
      });
  };

  const handleCapture = async (e) => {
    e.preventDefault();

    if (!modelsLoaded) {
      alert("models not loaded.");
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
        setDescriptor(Array.from(detection.descriptor)); // convertir en tableau pour Firestore
        console.log("face detected:", detection.descriptor);
      } else {
        alert("none face detected !");
      }
    } catch (err) {
      console.error("Error in detection :", err);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!descriptor) {
      alert("Please capture your face.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "userdatabase"), {
        name,
        mail,
        password,
        descriptor
      });
      alert("Successful registration !");
      console.log("Document ID:", docRef.id);
    } catch (e) {
      console.error("Erreur Firestore :", e);
      alert("Error while saving.");
    }
  };

  return (
    <div className='bloc'>
      <div className='sigup'>
        <h2>Sign up</h2>
        <h3>Create account</h3>
        <form className='form' onSubmit={handleSignup}>
          <label htmlFor="fullname">Full Name</label><br />
          <input type="text" name="fullname" value={name} onChange={(e) => setname(e.target.value)} />
          <i class="fas fa-user fa-lg me-3 fa-fw"></i>
          <br />
          <label htmlFor="email">Email</label><br />
          <input type="email" name="email" value={mail} onChange={(e) => setmail(e.target.value)} />
          <i class="fas fa-envelope fa-lg me-3 fa-fw"></i>
          <br />

          <label htmlFor="pwd">Password</label><br />
          <input type="password" name="pwd" value={password} onChange={(e) => setpassword(e.target.value)} />
          <i class="fas fa-lock fa-lg me-3 fa-fw"></i>
          <br />

          <label htmlFor="confpwd">Confirm Password</label><br />
          <input type="password" name="confpwd" value={confpassword} onChange={(e) => setconfpassword(e.target.value)}
            onBlur={() => {
              if (password && confpassword && password !== confpassword) {
                alert("Incorrect Password !");
              }
            }} />
          <i class="fas fa-key fa-lg me-3 fa-fw"></i>
          <br />
          <video ref={videoRef} autoPlay muted width="180" height="200" />
          <button onClick={handleCapture} id="buttonforcapture">capture face</button>
          {descriptor && (
          <p style={{ color: 'green' }}>Face captured successfully</p>
         
          )} <br/><br/>
          <button type='submit' id="buttonforsignup">Sign up</button>
        </form>
      </div>
    </div>
  );
}

export default Formulaire_signup;
