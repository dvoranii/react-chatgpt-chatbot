import { useState } from "react";
import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

const API_KEY = import.meta.env.VITE_GPT_KEY;

function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am ChatGPT",
      sender: "ChatGPT",
    },
  ]);

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing",
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);

    setTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  const simulateTypingEffect = (responseText) => {
    let currentText = "";
    setMessages((prevMessages) => [
      ...prevMessages,
      { message: "", sender: "ChatGPT" },
    ]);

    const typingInterval = setInterval(() => {
      if (currentText.length < responseText.length) {
        currentText += responseText[currentText.length];
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          { message: currentText, sender: "ChatGPT" },
        ]);
      } else {
        clearInterval(typingInterval);
        setTyping(false);
      }
    }, 20);
  };

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    const systemMessage = {
      role: "system",
      content: "Speak like a typical chat bot assistant",
    };

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessages],
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        // setMessages([
        //   ...chatMessages,
        //   {
        //     message: data.choices[0].message.content,
        //     sender: "ChatGPT",
        //   },
        // ]);
        simulateTypingEffect(data.choices[0].message.content);
        setTyping(false);
      });
  }

  return (
    <div className="App">
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={
                typing ? <TypingIndicator content="ChatGPT is Typing" /> : null
              }
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />;
              })}
            </MessageList>
            <MessageInput
              placeholder="Type message here"
              onSend={handleSend}
            ></MessageInput>
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
