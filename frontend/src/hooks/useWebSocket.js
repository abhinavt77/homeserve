import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('homeserve_token');

    // Create STOMP client with SockJS fallback
    const stompClient = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setConnected(true);
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onStompError: (frame) => {
        console.warn('STOMP protocol error:', frame.headers['message']);
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, []);

  const subscribe = useCallback(
    (topic, onMessage) => {
      if (!clientRef.current || !clientRef.current.connected) {
        // Retry subscription when client becomes connected
        const timer = setInterval(() => {
          if (clientRef.current && clientRef.current.connected) {
            clearInterval(timer);
            const sub = clientRef.current.subscribe(topic, (msg) => {
              try {
                const parsed = JSON.parse(msg.body);
                onMessage(parsed);
              } catch (e) {
                onMessage(msg.body);
              }
            });
            return () => sub.unsubscribe();
          }
        }, 500);

        return () => clearInterval(timer);
      }

      const subscription = clientRef.current.subscribe(topic, (msg) => {
        try {
          const parsed = JSON.parse(msg.body);
          onMessage(parsed);
        } catch (e) {
          onMessage(msg.body);
        }
      });

      return () => subscription.unsubscribe();
    },
    [connected]
  );

  return { connected, subscribe };
}
