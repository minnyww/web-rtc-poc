import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

function P2Pjs() {
    const [peerId, setPeerId] = useState('');
    const [remotePeerIdValue, setRemotePeerIdValue] = useState('');
    const remoteVideoRef = useRef(null);
    const currentUserVideoRef = useRef(null);
    const peerRef = useRef(null);

    useEffect(() => {
        const peer = new Peer();

        peer.on('open', (id) => {
            setPeerId(id)
        });

        peer.on('connection', function (con) {
            con.on('data', function (data) {
                console.log('Incoming data', data);
            });
        });

        // peer.on('data', (data) => {
        //     const message = data.toString('utf-8')
        //     console.log('message : ', message)
        //     // update('> ' + message)
        //     // console.log('peer received', message)
        // })

        peer.on('call', (call) => {
            var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            getUserMedia({ video: true, audio: true }, (mediaStream) => {
                currentUserVideoRef.current.srcObject = mediaStream;
                currentUserVideoRef.current.play();
                call.answer(mediaStream)
                call.on('stream', function (remoteStream) {
                    remoteVideoRef.current.srcObject = remoteStream
                    remoteVideoRef.current.play();
                });
            });
        })

        peerRef.current = peer;
    }, [])

    const callPeer = (remotePeerId) => {
        var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        getUserMedia({ video: true, audio: true }, (mediaStream) => {

            currentUserVideoRef.current.srcObject = mediaStream;
            currentUserVideoRef.current.play();

            const call = peerRef.current.call(remotePeerId, mediaStream)

            call.on('stream', (remoteStream) => {
                remoteVideoRef.current.srcObject = remoteStream
                remoteVideoRef.current.play();
            });
        });
    }

    return (
        <div className="App">
            <h1>Current user id is {peerId}</h1>
            <input type="text" value={remotePeerIdValue} onChange={e => setRemotePeerIdValue(e.target.value)} />
            <button onClick={() => callPeer(remotePeerIdValue)}>Call</button>
            <div>
                <video ref={currentUserVideoRef} />
            </div>
            <div>
                <video ref={remoteVideoRef} />
            </div>
            <button onClick={() => {
                const conn = peerRef.current.connect(remotePeerIdValue);
                conn.on("open", () => {
                    let data = {
                        message: "Test",
                        sender: peerId,
                        type: "message",
                    };

                    conn.send(data);
                });
            }}>send message</button>
        </div>
    );
}

export default P2Pjs;