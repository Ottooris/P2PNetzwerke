using System;
using System.Windows;

namespace PeerChat
{
    // Code-Behind für MainWindow.xaml
    // Verbindet die Benutzeroberfläche mit der P2P-Logik aus P2PManager
    public partial class MainWindow : Window
    {
        // Instanz des P2PManagers – kümmert sich um die gesamte Netzwerkkommunikation
        private P2PManager _p2p = new P2PManager();

        // Konstruktor – wird beim Starten der App aufgerufen
        public MainWindow()
        {
            // Lädt alle XAML-Elemente und macht sie im Code verfügbar
            InitializeComponent();

            // Zeigt die eigene lokale IP-Adresse im UI an
            LocalIpText.Text = P2PManager.GetLocalIPAddress();

            // Wenn eine Nachricht empfangen wird, wird sie zur ChatBox hinzugefügt
            // Dispatcher.Invoke ist nötig, weil der Netzwerk-Thread nicht direkt die UI ändern darf
            _p2p.MessageReceived += msg =>
                Dispatcher.Invoke(() =>
                    ChatBox.Items.Add(msg));

            // Wenn sich der Status ändert (z.B. "Verbunden!"), wird das Label aktualisiert
            _p2p.StatusChanged += status =>
                Dispatcher.Invoke(() =>
                    StatusText.Text = status);
        }

        // Klick auf "Host starten" – startet einen TCP-Server und wartet auf einen Client
        private async void Host_Click(object sender, RoutedEventArgs e)
        {
            int port = int.Parse(PortBox.Text);
            await _p2p.StartHosting(port);
        }

        // Klick auf "Verbinden" – verbindet sich als Client mit dem angegebenen Host
        private async void Connect_Click(object sender, RoutedEventArgs e)
        {
            string ip = IpBox.Text;
            int port = int.Parse(PortBox.Text);
            await _p2p.ConnectToPeer(ip, port);
        }

        // Klick auf "Senden" – sendet die Nachricht mit Zeitstempel und Benutzernamen
        private async void Send_Click(object sender, RoutedEventArgs e)
        {
            // Nur senden wenn eine Verbindung besteht
            if (!_p2p.IsConnected) return;

            string username = UsernameBox.Text;
            string message = MessageBox.Text;

            // Nachricht im Format: [HH:mm] Benutzername: Text
            string fullMessage = $"[{DateTime.Now:HH:mm}] {username}: {message}";

            // Nachricht über das Netzwerk senden
            await _p2p.SendMessage(fullMessage);

            // Nachricht auch lokal in der eigenen ChatBox anzeigen
            ChatBox.Items.Add(fullMessage);

            // Eingabefeld leeren
            MessageBox.Clear();
        }

        // Klick auf "Disconnect" – trennt die Verbindung
        private void Disconnect_Click(object sender, RoutedEventArgs e)
        {
            _p2p.Disconnect();
        }
    }
}
