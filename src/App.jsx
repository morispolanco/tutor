import React, { useState } from 'react'
import { Container, Typography, TextField, Button, Paper, Box, CircularProgress, Snackbar } from '@mui/material'
import axios from 'axios'

function App() {
  const [texto, setTexto] = useState('')
  const [pregunta, setPregunta] = useState('')
  const [respuesta, setRespuesta] = useState('')
  const [retroalimentacion, setRetroalimentacion] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const generarPregunta = async () => {
    setCargando(true)
    setError('')
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: "openai/gpt-3.5-turbo",
          messages: [
            { role: 'system', content: 'Eres un tutor de comprensión lectora. Genera una pregunta basada en el texto proporcionado. La pregunta debe estar en español.' },
            { role: 'user', content: `Genera una pregunta de comprensión lectora basada en este texto: "${texto}"` }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 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'
          }
        }
      )
      console.log('Respuesta de la API:', response.data)
      if (response.data.choices && response.data.choices.length > 0) {
        setPregunta(response.data.choices[0].message.content.trim())
      } else {
        setError('No se generó ninguna pregunta. Por favor, intenta de nuevo.')
      }
    } catch (error) {
      console.error('Error al generar la pregunta:', error)
      setError(`Error: ${error.response?.data?.error?.message || error.message}`)
    } finally {
      setCargando(false)
    }
  }

  const verificarRespuesta = async () => {
    setCargando(true)
    setError('')
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: "openai/gpt-3.5-turbo",
          messages: [
            { role: 'system', content: 'Eres un tutor de comprensión lectora. Evalúa la respuesta a la pregunta dada basándote en el texto. Tu retroalimentación debe estar en español.' },
            { role: 'user', content: `Texto: ${texto}\nPregunta: ${pregunta}\nRespuesta: ${respuesta}\n\nEvalúa la respuesta y proporciona retroalimentación en español.` }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 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'
          }
        }
      )
      if (response.data.choices && response.data.choices.length > 0) {
        setRetroalimentacion(response.data.choices[0].message.content.trim())
      } else {
        setError('No se generó retroalimentación. Por favor, intenta de nuevo.')
      }
    } catch (error) {
      console.error('Error al verificar la respuesta:', error)
      setError(`Error: ${error.response?.data?.error?.message || error.message}`)
    } finally {
      setCargando(false)
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tutor de Comprensión Lectora
        </Typography>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            label="Ingresa el texto"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button 
            variant="contained" 
            onClick={generarPregunta} 
            sx={{ mb: 2 }}
            disabled={cargando || !texto}
          >
            {cargando ? <CircularProgress size={24} /> : 'Generar Pregunta'}
          </Button>
          {pregunta && (
            <>
              <Typography variant="h6" gutterBottom>
                Pregunta:
              </Typography>
              <Typography paragraph>{pregunta}</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                label="Tu Respuesta"
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button 
                variant="contained" 
                onClick={verificarRespuesta}
                disabled={cargando || !respuesta}
              >
                {cargando ? <CircularProgress size={24} /> : 'Verificar Respuesta'}
              </Button>
            </>
          )}
        </Paper>
        {retroalimentacion && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Retroalimentación:
            </Typography>
            <Typography paragraph>{retroalimentacion}</Typography>
          </Paper>
        )}
      </Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        message={error}
      />
    </Container>
  )
}

export default App
