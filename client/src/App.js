import AppRouter from "./router/AppRouter";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./app/store";
import { ToastContainer } from "react-toastify";
import { SocketProvider } from "./SocketContext";

function App() {
  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SocketProvider>
            <AppRouter />
          </SocketProvider>
        </PersistGate>
      </Provider>
      <ToastContainer
        autoClose={3000}
        closeOnClick
        // theme="light" | "dark" from local-storage or hook
      />
    </>
  );
}

export default App;
