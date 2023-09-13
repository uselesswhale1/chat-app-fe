import { useEffect, ChangeEvent, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { server, w3cwebsocket } from 'websocket';
import { Card, Avatar, Input, Typography } from 'antd';
import './index.css';

const client = new w3cwebsocket('wss://78.26.151.4:8000', { transports: ['websocket'] });

const App = () => {
  const [state, setState] = useState({
    name: '',
    inputValue: '',
    isLoggedIn: false,
    messages: [],
  });

  useEffect(() => {
    client.onopen = () => {
      console.log('websocket client connected');
    };

    client.onmessage = (message) => {
      const serverData = JSON.parse(message.data);

      if (serverData.type === 'message') {
        setState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              msg: serverData.msg,
              user: serverData.user,
              time: serverData.time,
            }]
        }));
      }
    };
  }, []);

  const handleClick = () => {
    client.send(JSON.stringify({
      type: 'message',
      msg: state.inputValue,
      user: state.name,
      time: new Date(),
    }));
    setState(prev => ({ ...prev, inputValue: '' }));
  };

  return (
    <div className="main" id='wrapper'>
      {state.isLoggedIn ?
        <div>
          <div className="title">
            <Typography.Text id="main-heading" type="secondary" style={{ fontSize: '36px' }}>
              Websocket Chat: {state.name}
            </Typography.Text>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 50 }} id="messages">
            {state.messages.map(message =>
              <Card
                key={message.msg}
                style={{
                  width: 300,
                  margin: '16px 4px 0 4px',
                  alignSelf: state.name === message.user ? 'flex-end' : 'flex-start'
                }}
              >
                <Card.Meta
                  avatar={
                    <Avatar
                      style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
                      {message.user[0].toUpperCase()}
                    </Avatar>
                  }
                  title={message.user + ":"}
                  description={message.msg}
                />
              </Card>
            )}
          </div>
          <div className="bottom">
            <Input.Search
              placeholder="input message and send"
              enterButton="Send"
              value={state.searchVal}
              size="large"
              onChange={e => setState((prev) => ({ ...prev, inputValue: e.target.value }))}
              onSearch={handleClick}
            />
          </div>
        </div>
        :
        <div style={{ padding: '200px 40px' }}>
          <Input.Search
            placeholder="Enter name"
            enterButton="Login"
            size="large"
            onSearch={value => setState((prev) => ({ ...prev, isLoggedIn: true, name: value }))}
          />
        </div>
      }
    </div>
  )
};

const domNode = document.getElementById('root');
const root = createRoot(domNode);
root.render(<App />);