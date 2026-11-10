import AppRoutes from "./routes/AppRoutes";
import { NotificationProvider } from "./contexts/NotificationContext";
import { MessagingProvider } from "./contexts/MessagingContext";
import { WishlistProvider } from "./contexts/WishlistContext";

function App() {
  return (
    <NotificationProvider>
      <MessagingProvider>
        <WishlistProvider>
          <AppRoutes />
        </WishlistProvider>
      </MessagingProvider>
    </NotificationProvider>
  );
}

export default App;