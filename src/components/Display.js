import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import Editor from './Editor'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { Button } from 'react-bootstrap';
import DownloadIcon from './DownloadIcon';


export default function Display() {
    const { currentUser } = useAuth()
    const [html, setHtml] = useState()
    const [js, setJs] = useState()
    const [css, setCss] = useState()
    const [isSet, setIsSet] = useState(false);
    const id=currentUser.uid
    useEffect(() => {
        db.collection('yourcodepen').get()
            .then(snapshot => {
                snapshot.docs.forEach(doc => {
                    console.log(doc.id)
                    if (doc.id == id) {
                        var result = doc.data()
                        setHtml(result['html'])
                        setJs(result['js'])
                        setCss(result['css'])
                        setIsSet(true)
                    }
                })
            })
            if (isSet == false) {
                setHtml('write your html here')
                setJs('write your js here')
                setCss('write your css here')
            }
    }, [])
    const [srcDoc, setSrcDoc] = useState('')


    useEffect(() => {
        const timeout = setTimeout(() => {
            setSrcDoc(`
          <html>
            <body><style>${css}</style>${html}</body>
            <script>${js}</script>
          </html>
        `)
            let data = { html, css, js }

            db.collection('yourcodepen').doc(id).set(data);
        }, 1000)

        return () => clearTimeout(timeout)
    }, [html, css, js])

    const download = () => {
        var blob = new Blob([srcDoc], { type: "text/html;charset=utf-8" });
        saveAs(blob, "yourcodepen.html");
    }
    return (
        <React.Fragment>
            <div className="pane top-pane">
                <Editor
                    language="xml"
                    displayName="HTML"
                    value={html}
                    onChange={setHtml}
                />
                <Editor
                    language="css"
                    displayName="CSS"
                    value={css}
                    onChange={setCss}
                />
                <Editor
                    language="javascript"
                    displayName="JS"
                    value={js}
                    onChange={setJs}
                />
            </div>
            <div className="pane-bottom output" style={{ padding: "1%" }}>
                <div className="head">
                    <Button className="download" onClick={download} variant="outline-primary">
                        <DownloadIcon />
                    </Button>
                </div>
                <iframe
                    srcDoc={srcDoc}
                    title="output"
                    sandbox="allow-scripts"
                    frameBorder="0"
                    width="100%"
                    height="400vh"
                />
            </div>
        </React.Fragment>
    )
}
