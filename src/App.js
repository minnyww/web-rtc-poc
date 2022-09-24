import { useEffect, useRef } from 'react';
import './App.css';

function App() {
  const localVideoRef = useRef()
  const remoteVideoRef = useRef()

  const pcRef = useRef()
  const textRef = useRef()

  useEffect(() => {
    const constraints = {
      audio: true,
      video: true
    }
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
      localVideoRef.current.srcObject = stream

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
      })
    })


    const pc = new RTCPeerConnection(null)
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        console.log('candidate', JSON.stringify(e.candidate))
      }
    }

    pc.oniceconnectionstatechange = (e) => {
      console.log('oniceconnectionstatechange', e)
    }

    pc.ontrack = (e) => {
      remoteVideoRef.current.srcObject = e.streams[0]
    }
    pcRef.current = pc

  }, [])

  const createOffer = () => {
    pcRef.current.createOffer({
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1
    }).then(sdp => {
      console.log('offer', JSON.stringify(sdp))
      pcRef.current.setLocalDescription(sdp)
    })
  }

  const createAnswer = () => {
    pcRef.current.createAnswer({
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1
    }).then(sdp => {
      console.log('anwwer :', JSON.stringify(sdp))
      pcRef.current.setLocalDescription(sdp)
    })
  }


  const setRemoteDescription = () => {
    const sdp = JSON.parse(textRef.current.value)
    console.log('sdp --> ', sdp)
    pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp))
  }

  const addCandidate = () => {
    const candidate = JSON.parse(textRef.current.value)
    console.log('candidate --> ', candidate)
    pcRef.current.addIceCandidate(new RTCIceCandidate(candidate))
  }
  // const getUserMedia = () => {

  // }

  return (
    <div>
      <h2>Web RTC</h2>
      <video ref={localVideoRef} autoPlay></video>
      <video ref={remoteVideoRef} autoPlay></video>
      <button onClick={() => createOffer()}>create offer</button>
      <button onClick={() => createAnswer()}>create answer</button>

      <textarea ref={textRef}>

      </textarea>
      <button onClick={() => setRemoteDescription()}>set remote description</button>
      <button onClick={() => addCandidate()}>Add Candidate</button>
    </div>
  );
}

export default App;
