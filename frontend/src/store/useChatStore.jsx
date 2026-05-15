/**
 * @file useChatStore.js
 * @description Global chat state management using React Context + useReducer.
 * Manages conversations, messages, session tracking, and loading states.
 */

import { createContext, useContext, useReducer, useCallback } from "react";
import { sendMessage, getConversations, getConversation, deleteConversation } from "../services/api";

// ─── Initial State ────────────────────────────────────────────
const initialState = {
  messages: [],            // Current conversation messages
  conversations: [],       // Sidebar history list
  sessionId: null,         // Active session ID
  isLoading: false,        // AI is generating a response
  isSidebarOpen: true,     // Desktop sidebar visibility
  isMobileSidebarOpen: false,
  error: null,
  selectedModel: "gemini-1.5-flash",
};

// ─── Action Types ─────────────────────────────────────────────
const Actions = {
  SET_LOADING: "SET_LOADING",
  ADD_MESSAGE: "ADD_MESSAGE",
  SET_SESSION: "SET_SESSION",
  SET_CONVERSATIONS: "SET_CONVERSATIONS",
  LOAD_CONVERSATION: "LOAD_CONVERSATION",
  DELETE_CONVERSATION: "DELETE_CONVERSATION",
  TOGGLE_SIDEBAR: "TOGGLE_SIDEBAR",
  TOGGLE_MOBILE_SIDEBAR: "TOGGLE_MOBILE_SIDEBAR",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  NEW_CHAT: "NEW_CHAT",
  SET_MODEL: "SET_MODEL",
};

// ─── Reducer ──────────────────────────────────────────────────
function chatReducer(state, action) {
  switch (action.type) {
    case Actions.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case Actions.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null,
      };

    case Actions.SET_SESSION:
      return { ...state, sessionId: action.payload };

    case Actions.SET_CONVERSATIONS:
      return { ...state, conversations: action.payload };

    case Actions.LOAD_CONVERSATION:
      return {
        ...state,
        messages: action.payload.messages,
        sessionId: action.payload.sessionId,
        isMobileSidebarOpen: false,
      };

    case Actions.DELETE_CONVERSATION:
      return {
        ...state,
        conversations: state.conversations.filter(
          (c) => c.sessionId !== action.payload
        ),
        // If active conversation is deleted, reset to new chat
        ...(state.sessionId === action.payload && {
          messages: [],
          sessionId: null,
        }),
      };

    case Actions.TOGGLE_SIDEBAR:
      return { ...state, isSidebarOpen: !state.isSidebarOpen };

    case Actions.TOGGLE_MOBILE_SIDEBAR:
      return { ...state, isMobileSidebarOpen: !state.isMobileSidebarOpen };

    case Actions.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };

    case Actions.CLEAR_ERROR:
      return { ...state, error: null };

    case Actions.NEW_CHAT:
      return { ...state, messages: [], sessionId: null, error: null, isMobileSidebarOpen: false };

    case Actions.SET_MODEL:
      return { ...state, selectedModel: action.payload };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────
const ChatContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────
export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  /**
   * Sends a user message. Optimistically adds it to UI,
   * then waits for AI response.
   */
  const sendChat = useCallback(async (messageText) => {
    const userMessage = {
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
      id: Date.now(),
    };

    dispatch({ type: Actions.ADD_MESSAGE, payload: userMessage });
    dispatch({ type: Actions.SET_LOADING, payload: true });
    dispatch({ type: Actions.CLEAR_ERROR });

    try {
      const response = await sendMessage(messageText, state.sessionId, state.selectedModel);

      // Save the session ID from the first message
      if (!state.sessionId) {
        dispatch({ type: Actions.SET_SESSION, payload: response.data.sessionId });
      }

      const aiMessage = {
        role: "assistant",
        content: response.data.message,
        timestamp: response.data.timestamp,
        id: Date.now() + 1,
      };

      dispatch({ type: Actions.ADD_MESSAGE, payload: aiMessage });

      // Refresh sidebar history
      fetchConversations();
    } catch (error) {
      dispatch({
        type: Actions.SET_ERROR,
        payload: error.message || "Failed to get a response. Please try again.",
      });
    } finally {
      dispatch({ type: Actions.SET_LOADING, payload: false });
    }
  }, [state.sessionId, state.selectedModel]);

  /**
   * Loads conversation list for the sidebar.
   */
  const fetchConversations = useCallback(async () => {
    try {
      const response = await getConversations();
      dispatch({ type: Actions.SET_CONVERSATIONS, payload: response.data });
    } catch {
      // Silently fail — sidebar history is non-critical
    }
  }, []);

  /**
   * Loads a specific conversation by session ID.
   */
  const loadConversation = useCallback(async (sessionId) => {
    try {
      const response = await getConversation(sessionId);
      dispatch({
        type: Actions.LOAD_CONVERSATION,
        payload: {
          messages: response.data.messages,
          sessionId: response.data.sessionId,
        },
      });
    } catch (error) {
      dispatch({ type: Actions.SET_ERROR, payload: "Failed to load conversation." });
    }
  }, []);

  /**
   * Deletes a conversation from history.
   */
  const removeConversation = useCallback(async (sessionId) => {
    try {
      await deleteConversation(sessionId);
      dispatch({ type: Actions.DELETE_CONVERSATION, payload: sessionId });
    } catch (error) {
      dispatch({ type: Actions.SET_ERROR, payload: "Failed to delete conversation." });
    }
  }, []);

  const startNewChat = useCallback(() => {
    dispatch({ type: Actions.NEW_CHAT });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: Actions.TOGGLE_SIDEBAR });
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    dispatch({ type: Actions.TOGGLE_MOBILE_SIDEBAR });
  }, []);

  const setModel = useCallback((model) => {
    dispatch({ type: Actions.SET_MODEL, payload: model });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: Actions.CLEAR_ERROR });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        ...state,
        sendChat,
        fetchConversations,
        loadConversation,
        removeConversation,
        startNewChat,
        toggleSidebar,
        toggleMobileSidebar,
        setModel,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

/**
 * Custom hook to access chat state and actions.
 * Must be used within a ChatProvider.
 */
export function useChatStore() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChatStore must be used within ChatProvider");
  return context;
}
