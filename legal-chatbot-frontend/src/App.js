import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Card, Navbar, Dropdown } from 'react-bootstrap';
import { BsChatDots, BsArrowUp, BsGear, BsMoon, BsSun, BsTranslate } from 'react-icons/bs';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en'); // Default to English
  const [darkMode, setDarkMode] = useState(false);
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // Define API URLs - use env var for homelab, fallback to localhost for dev
  const apiEndpoints = {
    https: process.env.REACT_APP_API_URL || 'https://localhost:7263/api/chat',
    http: process.env.REACT_APP_API_URL || 'http://localhost:5135/api/chat'
  };

  // Auto-scroll to bottom when chat history changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  // Auto-resize the textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  const tryApiCall = async (endpoint, data) => {
    try {
      const response = await axios.post(endpoint, data);
      return response;
    } catch (error) {
      console.error(`Error calling ${endpoint}:`, error);
      throw error;
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message };
    setChatHistory([...chatHistory, userMessage]);
    setLoading(true);
    
    const requestData = {
      Message: message,
      Language: language
    };
    
    try {
      let response;
      
      // Try HTTPS first, then fall back to HTTP if HTTPS fails
      try {
        response = await tryApiCall(apiEndpoints.https, requestData);
      } catch (httpsError) {
        console.log('HTTPS endpoint failed, trying HTTP...');
        response = await tryApiCall(apiEndpoints.http, requestData);
      }
      
      setChatHistory(prevHistory => [...prevHistory, { role: 'assistant', content: response.data.message }]);
    } catch (error) {
      console.error('All API endpoints failed:', error);
      setChatHistory(prevHistory => [...prevHistory, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request. The API server might be unavailable.' 
      }]);
    } finally {
      setLoading(false);
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // Handle textarea key press (Enter to send, Shift+Enter for new line)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      <Navbar bg={darkMode ? 'dark' : 'primary'} variant={darkMode ? 'dark' : 'light'} className="app-header">
        <Container>
          <Navbar.Brand>
            <BsChatDots className="brand-icon" />
            <span className="brand-text">Legal AI Assistant</span>
          </Navbar.Brand>
          <div className="d-flex">
            <Dropdown align="end">
              <Dropdown.Toggle variant={darkMode ? 'outline-light' : 'outline-light'} id="language-dropdown">
                <BsTranslate className="dropdown-icon" /> {language === 'en' ? 'English' : 'Macedonian'}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setLanguage('en')} active={language === 'en'}>English</Dropdown.Item>
                <Dropdown.Item onClick={() => setLanguage('mk')} active={language === 'mk'}>Macedonian</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
            <Button variant={darkMode ? 'outline-light' : 'outline-light'} className="ms-2" onClick={toggleDarkMode}>
              {darkMode ? <BsSun /> : <BsMoon />}
            </Button>
          </div>
        </Container>
      </Navbar>

      <Container fluid className="main-content">
        <Row className="justify-content-center">
          <Col lg={8} md={10} sm={12}>
            <Card className="chat-card">
            <Card.Header className="chat-header">
              <h5 className="mb-0">
                {language === 'en'
                  ? 'Ask questions about legal and accounting matters in English'
                  : 'Поставете прашања за правни и сметководствени работи на македонски'}
              </h5>
            </Card.Header>
              
              <Card.Body className="chat-body" ref={chatContainerRef}>
              {chatHistory.length === 0 && (
  language === 'en' ? (
    <div className="welcome-message">
      <h4>Welcome to Legal AI Assistant!</h4>
      <p>Ask me any question about legal and accounting matters in Macedonia.</p>
      <div className="welcome-examples">
        Try asking about:
        <ul>
          <li>Value Added Tax regulations</li>
          <li>Corporate law requirements</li>
          <li>Business registration procedures</li>
        </ul>
      </div>
    </div>
  ) : (
    <div className="welcome-message">
      <h4>Добредојдовте во Правен AI Асистент!</h4>
      <p>Поставете прашање за правни и сметководствени работи во Македонија.</p>
      <div className="welcome-examples">
        Обидете се со:
        <ul>
          <li>Регулативите за ДДВ</li>
          <li>Барањата од корпоративното право</li>
          <li>Постапките за регистрација на бизнис</li>
        </ul>
      </div>
    </div>
  )
)}
                
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`message-container ${msg.role}-container`}>
                    <div className={`message ${msg.role}`}>
                      <div className="message-content">
                        {msg.content.split('\n').map((line, i) => (
                          <span key={i}>
                            {line}
                            {i < msg.content.split('\n').length - 1 && <br />}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="message-container assistant-container">
                    <div className="message assistant">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
              </Card.Body>
              
              <Card.Footer className="chat-footer">
                <Form onSubmit={sendMessage}>
                  <div className="message-input-container">
                    <Form.Control
                      as="textarea"
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your message... (Shift+Enter for new line)"
                      disabled={loading}
                      rows={1}
                      className="message-input"
                    />
                    <Button 
                      variant={darkMode ? 'outline-light' : 'primary'} 
                      type="submit" 
                      disabled={loading || !message.trim()} 
                      className="send-button"
                    >
                      <BsArrowUp />
                    </Button>
                  </div>
                  <div className="input-hint">
                    Press Enter to send, Shift+Enter for new line
                  </div>
                </Form>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
