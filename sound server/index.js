const express = require('express');
const { spawn } = require('child_process');
const app = express();
const port = process.env.PORT || 8080;

// Store the currently running processes
let rtl_fm = null;
let ffmpeg = null;
let sox = null
let frequency = 101.7

// Function to start the radio streaming process
async function startRadioStreaming(filename = 'output.mp3') {
  // If processes are running, stop them
  if (rtl_fm) { rtl_fm.kill('SIGINT'); }
  if (sox) { sox.kill('SIGINT'); }

  // Start new processes
  rtl_fm = spawn('rtl_fm', ['-f', frequency, '-M', 'wbfm', '-s', '200000', '-r', '48000', '-']);
  sox = spawn('sox', ['-traw', '-r24k', '-es', '-b16', '-c1', '-V1', '-', '-tmp3', filename]);

  rtl_fm.stdout.pipe(sox.stdin);

    await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(); 
        }, 5000);
    });
        // Handle errors for both processes
    rtl_fm.on('error', (err) => {
      console.error('Error executing rtl_fm:', err.message);
    });
  
    sox.on('error', (err) => {
      console.error('Error executing sox:', err.message);
    });
  
    // Handle sox exit (recording complete)
    sox.on('exit', (code) => {
      if (code === 0) {
        console.log(`Audio recording saved to ${filename}`);
      } else {
        console.error('Audio recording failed with exit code:', code);
      }
    });
  }
  

// ... (rest of your app setup) ...
app.get('/api/radio/stream', (req, res) => {
    res.set('Content-Type', 'audio/mpeg');
  
    // Start processes and pipe output directly to response
    const rtl_fm = spawn('rtl_fm', /* ... your args ... */);
    const sox = spawn('sox', /* ... your args ... */);
  
    rtl_fm.stdout.pipe(sox.stdin);
    sox.stdout.pipe(res);
  
    // More elaborate error handling needed when streaming is involved
  });

  app.post('/api/frequency', (req, res) => {
    const { newFrequency } = req.body;
    if (newFrequency) {
      currentFrequency = newFrequency;
      startRadioStreaming(newFrequency); 
      res.json({ message: `Frequency set to ${newFrequency}` });
    } else {
      res.status(400).json({ error: 'Invalid frequency provided' });
    }
  });
  

// Start the initial streaming process
startRadioStreaming('101.7M'); 