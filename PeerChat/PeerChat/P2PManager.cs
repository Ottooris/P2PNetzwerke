using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace PeerChat
{
    // Verwaltet die gesamte Peer-to-Peer Netzwerkkommunikation über TCP
    // Kann entweder als Host (Server) oder als Client fungieren
    public class P2PManager
    {
        // Wartet als Host auf eingehende Verbindungen
        private TcpListener _listener;

        // Repräsentiert die aktive Verbindung (egal ob Host oder Client)
        private TcpClient _client;

        // Der Datenstrom, über den Bytes gesendet und empfangen werden
        private NetworkStream _stream;

        // Gibt an ob gerade eine aktive Verbindung besteht
        public bool IsConnected => _client?.Connected ?? false;

        // Wird ausgelöst wenn eine neue Nachricht vom Peer empfangen wurde
        public event Action<string> MessageReceived;

        // Wird ausgelöst wenn sich der Verbindungsstatus ändert (z.B. "Verbunden!", "Getrennt")
        public event Action<string> StatusChanged;

        // Startet diesen Peer als Host – öffnet einen Listener und wartet auf einen Client
        public async Task StartHosting(int port)
        {
            // Lauscht auf allen Netzwerkschnittstellen
            _listener = new TcpListener(IPAddress.Any, port);
            _listener.Start();

            StatusChanged?.Invoke("Warte auf Verbindung...");

            // Wartet asynchron bis sich ein Client verbindet
            _client = await _listener.AcceptTcpClientAsync();
            _stream = _client.GetStream();

            StatusChanged?.Invoke("Client verbunden!");

            // Startet die Empfangsschleife im Hintergrund
            _ = ReceiveLoop();
        }

        // Verbindet sich als Client mit einem Host
        public async Task ConnectToPeer(string ip, int port)
        {
            _client = new TcpClient();
            await _client.ConnectAsync(IPAddress.Parse(ip), port);

            _stream = _client.GetStream();
            StatusChanged?.Invoke("Verbunden!");

            // Startet die Empfangsschleife im Hintergrund
            _ = ReceiveLoop();
        }

        // Sendet eine Nachricht als Text an den verbundenen Peer
        public async Task SendMessage(string message)
        {
            if (_stream == null) return;

            // Text in Bytes umwandeln und senden
            byte[] data = Encoding.UTF8.GetBytes(message + "\n");
            await _stream.WriteAsync(data);
        }

        // Läuft dauerhaft im Hintergrund und empfängt eingehende Nachrichten
        private async Task ReceiveLoop()
        {
            // Puffer für eingehende Daten (max. 2048 Bytes pro Lesevorgang)
            byte[] buffer = new byte[2048];

            while (_client?.Connected == true)
            {
                // Wartet asynchron auf neue Daten
                int bytesRead = await _stream.ReadAsync(buffer);

                // 0 Bytes bedeutet die Gegenseite hat die Verbindung geschlossen
                if (bytesRead == 0)
                    break;

                // Bytes in lesbaren Text umwandeln und das Event auslösen
                string message = Encoding.UTF8.GetString(buffer, 0, bytesRead);
                MessageReceived?.Invoke(message.Trim());
            }

            StatusChanged?.Invoke("Verbindung getrennt");
        }

        // Trennt die Verbindung und gibt alle Ressourcen frei
        public void Disconnect()
        {
            _stream?.Close();
            _client?.Close();
            _listener?.Stop();
            StatusChanged?.Invoke("Getrennt");
        }

        // Gibt die lokale IPv4-Adresse des Geräts zurück
        // Wird im UI angezeigt damit der Nutzer seine IP kennt
        public static string GetLocalIPAddress()
        {
            // Alle IP-Adressen durchsuchen und die erste IPv4-Adresse zurückgeben
            foreach (var ip in Dns.GetHostEntry(Dns.GetHostName()).AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork)
                    return ip.ToString();
            }
            return "Keine IP gefunden";
        }
    }
}
