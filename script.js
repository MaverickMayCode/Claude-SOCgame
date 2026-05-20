/* ============================================================
   SOC_ANALYST_1_STUDY_TERMINAL — script.js
   All logic + study data. No frameworks, no build step.
   ============================================================ */

/* ============================================================
   1. FLASHCARD DATA
   Edit / add cards here. Each needs:
   id, category, question, answer, difficulty, tags
   ============================================================ */

const flashcards = [
  // ---------- Networking Basics ----------
  { id: "net-1", category: "Networking Basics", question: "What is the difference between TCP and UDP?",
    answer: "TCP is connection-oriented, reliable, and ordered (uses 3-way handshake). UDP is connectionless, faster, no guaranteed delivery. SOC tip: SYN floods abuse TCP handshake; DNS, NTP, and many amplification attacks ride on UDP.",
    difficulty: "easy", tags: ["TCP", "UDP", "Networking"] },
  { id: "net-2", category: "Networking Basics", question: "What is the TCP 3-way handshake?",
    answer: "SYN -> SYN/ACK -> ACK. Client sends SYN, server replies SYN/ACK, client confirms with ACK. Half-open connections (lots of SYNs with no ACKs) often indicate SYN flood or scanning.",
    difficulty: "easy", tags: ["TCP", "Handshake"] },
  { id: "net-3", category: "Networking Basics", question: "What is the difference between a public and private IP?",
    answer: "Private IPs (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) are used inside LANs and are not routable on the internet. Public IPs are globally routable. NAT translates between them.",
    difficulty: "easy", tags: ["IP", "NAT"] },
  { id: "net-4", category: "Networking Basics", question: "What is the OSI model and which layers does a SOC analyst care about most?",
    answer: "7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application. SOC analysts mostly work with L3 (IP), L4 (TCP/UDP ports), and L7 (HTTP/DNS/SMB payloads in logs).",
    difficulty: "medium", tags: ["OSI", "Layers"] },
  { id: "net-5", category: "Networking Basics", question: "What is a CIDR block like /24?",
    answer: "CIDR notation: the number is how many bits are network bits. /24 = 256 addresses (254 usable). /16 = 65,536. Useful for quickly judging whether two IPs are on the same subnet.",
    difficulty: "medium", tags: ["CIDR", "Subnet"] },
  { id: "net-6", category: "Networking Basics", question: "What is ARP and how is it abused?",
    answer: "ARP maps IP addresses to MAC addresses on a LAN. ARP spoofing/poisoning sends forged ARP replies so an attacker positions themselves as the gateway for MitM attacks.",
    difficulty: "medium", tags: ["ARP", "MitM"] },
  { id: "net-7", category: "Networking Basics", question: "What does DNS do and why is it important to SOC analysts?",
    answer: "DNS resolves domain names to IPs. SOC analysts watch DNS for malware C2 lookups, DGA domains, DNS tunneling, and queries to known-bad TLDs or newly registered domains.",
    difficulty: "easy", tags: ["DNS", "C2"] },

  // ---------- Ports and Protocols ----------
  { id: "port-1", category: "Ports and Protocols", question: "What port does DNS usually use?",
    answer: "Port 53. DNS usually uses UDP 53, but can use TCP 53 for zone transfers or large responses (>512 bytes).",
    difficulty: "easy", tags: ["DNS", "53"] },
  { id: "port-2", category: "Ports and Protocols", question: "What port is HTTPS?",
    answer: "TCP 443. Encrypted HTTP using TLS. The most common outbound port in enterprises, which is why attackers love hiding C2 in it.",
    difficulty: "easy", tags: ["HTTPS", "443"] },
  { id: "port-3", category: "Ports and Protocols", question: "What port is SMB?",
    answer: "TCP 445 (and historically 137/138/139 over NetBIOS). SMB is used for Windows file sharing and lateral movement (e.g. PsExec, EternalBlue).",
    difficulty: "easy", tags: ["SMB", "445"] },
  { id: "port-4", category: "Ports and Protocols", question: "What port is RDP?",
    answer: "TCP 3389. Remote Desktop Protocol for Windows. Frequent target for brute force; exposed RDP on the internet is a major risk.",
    difficulty: "easy", tags: ["RDP", "3389"] },
  { id: "port-5", category: "Ports and Protocols", question: "What ports are SSH and Telnet?",
    answer: "SSH = TCP 22 (encrypted). Telnet = TCP 23 (cleartext). Telnet should never be allowed externally.",
    difficulty: "easy", tags: ["SSH", "Telnet"] },
  { id: "port-6", category: "Ports and Protocols", question: "What ports are SMTP, IMAP, POP3?",
    answer: "SMTP = 25 (or 587 submission, 465 SMTPS). IMAP = 143 (993 with TLS). POP3 = 110 (995 with TLS).",
    difficulty: "medium", tags: ["Mail", "SMTP"] },
  { id: "port-7", category: "Ports and Protocols", question: "What port is LDAP / LDAPS?",
    answer: "LDAP = TCP 389 (cleartext). LDAPS = TCP 636 (TLS). Global Catalog uses 3268/3269.",
    difficulty: "medium", tags: ["LDAP", "AD"] },
  { id: "port-8", category: "Ports and Protocols", question: "What port is Kerberos?",
    answer: "TCP/UDP 88. Used for Active Directory authentication. Kerberoasting and AS-REP roasting attacks target it.",
    difficulty: "medium", tags: ["Kerberos", "AD"] },

  // ---------- Linux Commands ----------
  { id: "lin-1", category: "Linux Commands", question: "What does `grep -i 'failed' /var/log/auth.log` do?",
    answer: "Searches /var/log/auth.log for any line containing 'failed' (case-insensitive). Common quick way to spot failed SSH logins or auth failures.",
    difficulty: "easy", tags: ["grep", "logs"] },
  { id: "lin-2", category: "Linux Commands", question: "What is the difference between `ss` and `netstat`?",
    answer: "Both show network sockets/connections. `ss` is the modern replacement, faster, reads directly from kernel. `netstat` is legacy. Typical use: `ss -tunap` to see TCP/UDP listening + established with PIDs.",
    difficulty: "medium", tags: ["ss", "netstat"] },
  { id: "lin-3", category: "Linux Commands", question: "How do you view the last 100 lines of a log and follow new entries?",
    answer: "`tail -n 100 -f /path/to/log` (or `tail -f` to just follow). For systemd logs, use `journalctl -u service -f`.",
    difficulty: "easy", tags: ["tail", "logs"] },
  { id: "lin-4", category: "Linux Commands", question: "What does `chmod 755` mean?",
    answer: "Owner: read/write/execute (7). Group: read/execute (5). Others: read/execute (5). Common for executables and directories. 777 means everyone has full access (almost always a red flag).",
    difficulty: "medium", tags: ["chmod", "permissions"] },
  { id: "lin-5", category: "Linux Commands", question: "What command shows running processes and who started them?",
    answer: "`ps aux` or `ps -ef`. For an interactive view use `top` or `htop`. SOC use: spot suspicious child processes or unexpected parents (e.g. winword.exe -> powershell, or bash spawned by apache).",
    difficulty: "easy", tags: ["ps", "processes"] },
  { id: "lin-6", category: "Linux Commands", question: "How do you check who is currently logged in?",
    answer: "`who`, `w`, or `last`. `last` reads /var/log/wtmp and shows historical logins. `w` shows current sessions with what they're running.",
    difficulty: "easy", tags: ["who", "logins"] },

  // ---------- Windows Commands ----------
  { id: "win-1", category: "Windows Commands", question: "What does `whoami /priv` show?",
    answer: "Lists the privileges held by your current token (e.g. SeDebugPrivilege, SeImpersonatePrivilege). Useful for confirming privilege escalation or what an attacker would have if they compromised this session.",
    difficulty: "medium", tags: ["whoami", "privileges"] },
  { id: "win-2", category: "Windows Commands", question: "How do you list local users via cmd vs PowerShell?",
    answer: "cmd: `net user`. PowerShell: `Get-LocalUser`. Add a username to see details: `net user bob` or `Get-LocalUser bob | fl *`.",
    difficulty: "easy", tags: ["users", "net"] },
  { id: "win-3", category: "Windows Commands", question: "How do you see scheduled tasks from the command line?",
    answer: "`schtasks /query /fo LIST /v` (verbose) or PowerShell `Get-ScheduledTask`. Persistence often hides in scheduled tasks.",
    difficulty: "medium", tags: ["schtasks", "persistence"] },
  { id: "win-4", category: "Windows Commands", question: "How do you list listening ports on Windows?",
    answer: "`netstat -ano` shows all connections + listening sockets with PIDs. Pair with `tasklist /fi \"pid eq <PID>\"` to identify the process.",
    difficulty: "easy", tags: ["netstat", "ports"] },
  { id: "win-5", category: "Windows Commands", question: "What does `Get-WinEvent -LogName Security -MaxEvents 50` do?",
    answer: "Pulls the most recent 50 entries from the Security event log. Filter further with `-FilterHashtable @{LogName='Security'; ID=4625}` for failed logons.",
    difficulty: "medium", tags: ["PowerShell", "events"] },
  { id: "win-6", category: "Windows Commands", question: "How do you check group membership on Windows?",
    answer: "`net localgroup administrators` shows local admins. `whoami /groups` shows your current token's groups. PowerShell: `Get-LocalGroupMember -Group Administrators`.",
    difficulty: "easy", tags: ["groups", "admins"] },

  // ---------- SIEM Concepts ----------
  { id: "siem-1", category: "SIEM Concepts", question: "What is a SIEM?",
    answer: "Security Information and Event Management. Centralizes logs from many sources, normalizes them, correlates events, and generates alerts. Examples: Splunk, Sentinel, QRadar, Elastic.",
    difficulty: "easy", tags: ["SIEM"] },
  { id: "siem-2", category: "SIEM Concepts", question: "What is log normalization?",
    answer: "Converting logs from different formats/vendors into a common schema (fields like src_ip, user, action) so you can query and correlate across sources.",
    difficulty: "medium", tags: ["normalization"] },
  { id: "siem-3", category: "SIEM Concepts", question: "What is correlation in a SIEM?",
    answer: "Linking multiple events into a single meaningful alert. E.g. 10 failed logons + 1 success + a process spawn from that account = likely compromise, not just a noisy login.",
    difficulty: "medium", tags: ["correlation"] },
  { id: "siem-4", category: "SIEM Concepts", question: "What is the difference between true positive, false positive, true negative, false negative?",
    answer: "TP = alert fired AND real threat. FP = alert fired BUT no threat. TN = no alert AND no threat. FN = no alert BUT real threat happened (the worst kind).",
    difficulty: "easy", tags: ["alerts", "triage"] },
  { id: "siem-5", category: "SIEM Concepts", question: "What is alert fatigue and how do you fight it?",
    answer: "When analysts become numb due to too many low-quality alerts. Fight it by tuning detections, suppressing known-good behavior, raising thresholds, and prioritizing by asset/user criticality.",
    difficulty: "easy", tags: ["tuning"] },
  { id: "siem-6", category: "SIEM Concepts", question: "What does enrichment mean in SIEM context?",
    answer: "Adding context to raw events: GeoIP, threat intel, asset owner, user role, ASN. A failed login becomes much more meaningful when you know the user is a domain admin from an unusual country.",
    difficulty: "medium", tags: ["enrichment"] },

  // ---------- Log Analysis ----------
  { id: "log-1", category: "Log Analysis", question: "Windows Event ID 4624 vs 4625?",
    answer: "4624 = successful logon. 4625 = failed logon. Pay attention to logon type (2 = interactive, 3 = network, 10 = remote interactive/RDP).",
    difficulty: "easy", tags: ["EventID", "Windows"] },
  { id: "log-2", category: "Log Analysis", question: "What is Windows Event ID 4688?",
    answer: "Process creation event. Tells you which process was launched, by which parent, under which user. Gold for hunting (powershell.exe spawning from winword.exe, etc).",
    difficulty: "medium", tags: ["EventID", "Process"] },
  { id: "log-3", category: "Log Analysis", question: "Which log on Linux records SSH login attempts?",
    answer: "/var/log/auth.log on Debian/Ubuntu, /var/log/secure on RHEL/CentOS. Look for 'Accepted password', 'Failed password', and 'session opened' lines.",
    difficulty: "easy", tags: ["Linux", "SSH"] },
  { id: "log-4", category: "Log Analysis", question: "What does logon type 3 mean in Windows logs?",
    answer: "Network logon. Typical for SMB file share access or remote tool execution. A burst of type 3 logons from one source to many destinations can indicate lateral movement.",
    difficulty: "medium", tags: ["LogonType"] },
  { id: "log-5", category: "Log Analysis", question: "What does a sudden spike in 4625 events from one source IP suggest?",
    answer: "Likely brute force or password spraying. Check usernames tried (one user many passwords = brute force; many users one password = spraying).",
    difficulty: "easy", tags: ["BruteForce"] },
  { id: "log-6", category: "Log Analysis", question: "Why are timestamps tricky in log analysis?",
    answer: "Sources can be in different time zones, clocks can drift, daylight saving can offset. Always normalize to UTC and verify time sync (NTP) when correlating across systems.",
    difficulty: "medium", tags: ["Timestamps", "UTC"] },

  // ---------- MITRE ATT&CK ----------
  { id: "att-1", category: "MITRE ATT&CK", question: "What is MITRE ATT&CK?",
    answer: "A knowledge base of adversary tactics, techniques, and procedures (TTPs) based on real-world observations. Used to map detections and understand attacker behavior.",
    difficulty: "easy", tags: ["MITRE"] },
  { id: "att-2", category: "MITRE ATT&CK", question: "Difference between Tactic, Technique, and Procedure?",
    answer: "Tactic = the WHY (the goal, e.g. Persistence). Technique = the HOW (e.g. Scheduled Task). Procedure = the specific implementation (e.g. attacker creating a task named 'updater' that runs every 5 min).",
    difficulty: "medium", tags: ["TTP"] },
  { id: "att-3", category: "MITRE ATT&CK", question: "What MITRE technique is brute force?",
    answer: "T1110 - Brute Force. Sub-techniques include Password Guessing (.001), Password Cracking (.002), Password Spraying (.003), Credential Stuffing (.004).",
    difficulty: "medium", tags: ["T1110"] },
  { id: "att-4", category: "MITRE ATT&CK", question: "What MITRE technique covers PowerShell abuse?",
    answer: "T1059.001 - Command and Scripting Interpreter: PowerShell. Watch for encoded commands (-EncodedCommand), hidden windows, and Invoke-Expression.",
    difficulty: "medium", tags: ["T1059"] },
  { id: "att-5", category: "MITRE ATT&CK", question: "What are the 14 ATT&CK Enterprise tactics (in order)?",
    answer: "Reconnaissance, Resource Development, Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection, C2, Exfiltration, Impact.",
    difficulty: "hard", tags: ["Tactics"] },
  { id: "att-6", category: "MITRE ATT&CK", question: "What is T1078?",
    answer: "Valid Accounts. Attacker uses legitimate credentials (stolen, default, or shared) to access systems. Hard to detect because it looks like normal login.",
    difficulty: "medium", tags: ["T1078"] },

  // ---------- Common Alerts ----------
  { id: "alert-fc-1", category: "Common Alerts", question: "What does 'impossible travel' mean as an alert?",
    answer: "The same user authenticated from two locations too geographically far apart in too little time (e.g. New York at 10:00 then Russia at 10:15). Indicates credential compromise or VPN use.",
    difficulty: "easy", tags: ["ImpossibleTravel"] },
  { id: "alert-fc-2", category: "Common Alerts", question: "What is a 'low and slow' brute force?",
    answer: "Many failed login attempts spread across a long time window and/or many source IPs to stay under detection thresholds. Detect via aggregate counts over hours/days, not minutes.",
    difficulty: "medium", tags: ["BruteForce"] },
  { id: "alert-fc-3", category: "Common Alerts", question: "Why is a PowerShell process with an encoded command suspicious?",
    answer: "Encoded commands (-enc / -EncodedCommand) are commonly used by attackers and malware to hide what they're actually running. Legitimate scripts rarely need encoding.",
    difficulty: "easy", tags: ["PowerShell"] },
  { id: "alert-fc-4", category: "Common Alerts", question: "What is beaconing and how do you spot it?",
    answer: "Malware periodically calling home to C2 at regular intervals. Look for repeated outbound connections to the same destination on a steady cadence (e.g. every 60 seconds +/- jitter).",
    difficulty: "medium", tags: ["C2", "Beacon"] },
  { id: "alert-fc-5", category: "Common Alerts", question: "Why is a logon at 3 AM from a non-IT user worth investigating?",
    answer: "Out-of-baseline behavior. Combine with: did they access unusual systems, was there data movement, did they elevate privileges? Time alone isn't enough but it's a strong starting signal.",
    difficulty: "easy", tags: ["UEBA"] },
  { id: "alert-fc-6", category: "Common Alerts", question: "What's wrong with a workstation suddenly making 1000 SMB connections to other workstations?",
    answer: "Lateral movement / worm behavior. Workstations rarely talk to each other directly on SMB; they normally hit servers. Mass SMB lateral pattern = strong worm/ransomware indicator.",
    difficulty: "medium", tags: ["Lateral"] },

  // ---------- Malware Basics ----------
  { id: "mal-1", category: "Malware Basics", question: "Difference between a virus, worm, and trojan?",
    answer: "Virus = needs a host file and user execution to spread. Worm = self-propagates over network without user action. Trojan = disguised as legitimate software, must be run by user.",
    difficulty: "easy", tags: ["Virus", "Worm"] },
  { id: "mal-2", category: "Malware Basics", question: "What is ransomware and how do you spot it early?",
    answer: "Malware that encrypts files and demands payment. Early signs: mass file rename/extension changes, shadow copy deletion (vssadmin), disabled security tools, and high disk I/O across shares.",
    difficulty: "easy", tags: ["Ransomware"] },
  { id: "mal-3", category: "Malware Basics", question: "What is a RAT?",
    answer: "Remote Access Trojan. Gives an attacker full interactive control of a host. Examples: njRAT, QuasarRAT, AsyncRAT. Often deployed via phishing droppers.",
    difficulty: "easy", tags: ["RAT"] },
  { id: "mal-4", category: "Malware Basics", question: "What is a dropper?",
    answer: "A small program whose only job is to download and execute the real payload. Lets attackers keep the heavy malware off the initial infection vector (e.g. email attachment).",
    difficulty: "medium", tags: ["Dropper"] },
  { id: "mal-5", category: "Malware Basics", question: "What is fileless malware?",
    answer: "Malware that operates entirely in memory or via legitimate tools (LOLBins like powershell, wmic, mshta). Leaves little disk evidence, so detection relies on behavior, not file hashes.",
    difficulty: "medium", tags: ["Fileless", "LOLBin"] },
  { id: "mal-6", category: "Malware Basics", question: "What is a hash and which ones are common in SOC work?",
    answer: "A one-way fingerprint of a file. SHA-256 is preferred. MD5 and SHA-1 are still seen in threat intel but considered weak. Used for matching against IOC lists.",
    difficulty: "easy", tags: ["Hash"] },

  // ---------- Phishing Analysis ----------
  { id: "phish-1", category: "Phishing Analysis", question: "What are the first 3 things to check in a suspected phishing email?",
    answer: "1) Sender address vs display name mismatch and SPF/DKIM/DMARC results. 2) Any URLs - hover the real destination, check domain reputation. 3) Attachments - file type, hash, and whether macros are present.",
    difficulty: "easy", tags: ["Phishing"] },
  { id: "phish-2", category: "Phishing Analysis", question: "What do SPF, DKIM, and DMARC do?",
    answer: "SPF = which IPs are allowed to send mail for a domain. DKIM = cryptographic signature on the message. DMARC = tells receivers what to do when SPF/DKIM fail (none/quarantine/reject) and where to report.",
    difficulty: "medium", tags: ["SPF", "DKIM", "DMARC"] },
  { id: "phish-3", category: "Phishing Analysis", question: "Why is a URL like 'micros0ft-login.com' suspicious?",
    answer: "Typosquatting / homoglyph attack. Attackers register domains that look like trusted ones (zero for o, rn for m, etc). Always check the real domain, not the visible text.",
    difficulty: "easy", tags: ["URL", "Typosquatting"] },
  { id: "phish-4", category: "Phishing Analysis", question: "How do you safely analyze a suspicious URL?",
    answer: "Never click in production. Use a sandbox (urlscan.io, ANY.RUN, Joe Sandbox) or fetch with curl from an isolated VM. Check WHOIS age - newly registered domains are very suspicious.",
    difficulty: "medium", tags: ["URL", "Sandbox"] },
  { id: "phish-5", category: "Phishing Analysis", question: "What's the difference between phishing, spear phishing, and whaling?",
    answer: "Phishing = mass, untargeted. Spear phishing = targeted at a specific person/role. Whaling = spear phishing aimed at a high-value target like a CEO or CFO.",
    difficulty: "easy", tags: ["Phishing"] },
  { id: "phish-6", category: "Phishing Analysis", question: "What is BEC?",
    answer: "Business Email Compromise. Attacker impersonates or compromises a real internal account (often an executive or vendor) to redirect payments or steal data. Usually no malware, just social engineering.",
    difficulty: "medium", tags: ["BEC"] },

  // ---------- Incident Response ----------
  { id: "ir-1", category: "Incident Response", question: "What are the NIST IR phases?",
    answer: "Preparation, Detection & Analysis, Containment, Eradication, Recovery, Post-Incident Activity (lessons learned). SANS uses a similar 6-step PICERL model.",
    difficulty: "easy", tags: ["NIST", "IR"] },
  { id: "ir-2", category: "Incident Response", question: "What's the difference between an event, alert, and incident?",
    answer: "Event = anything observable in a system. Alert = an event flagged as potentially worth attention. Incident = confirmed adverse security event that needs response.",
    difficulty: "easy", tags: ["Triage"] },
  { id: "ir-3", category: "Incident Response", question: "What is containment vs eradication?",
    answer: "Containment = stop the bleeding (isolate host, disable account). Eradication = remove the threat (delete malware, close vuln, rotate creds). Don't eradicate before you've collected evidence.",
    difficulty: "medium", tags: ["IR"] },
  { id: "ir-4", category: "Incident Response", question: "What is chain of custody?",
    answer: "Documented trail of who handled evidence, when, and how. Required for evidence to hold up legally. Includes hashes of collected artifacts, timestamps, and handoffs.",
    difficulty: "medium", tags: ["Forensics"] },
  { id: "ir-5", category: "Incident Response", question: "Should you immediately reboot a compromised host?",
    answer: "Usually NO. Rebooting destroys volatile memory and may wipe running malware indicators. First, collect volatile data (memory, network connections, processes) then decide on isolation vs power-off.",
    difficulty: "medium", tags: ["Forensics"] },
  { id: "ir-6", category: "Incident Response", question: "What is the goal of post-incident review?",
    answer: "Identify root cause, fix the gap that allowed it, and improve detection so it doesn't recur. Output: detection rules, process updates, training. Blameless culture works best.",
    difficulty: "easy", tags: ["LessonsLearned"] },

  // ---------- Security Tools ----------
  { id: "tool-1", category: "Security Tools", question: "What is EDR and how is it different from antivirus?",
    answer: "Endpoint Detection and Response. Continuously records process/file/network activity on endpoints and detects via behavior, not just signatures. AV = static signatures, EDR = behavior + telemetry + response actions.",
    difficulty: "easy", tags: ["EDR", "AV"] },
  { id: "tool-2", category: "Security Tools", question: "What does an IDS vs IPS do?",
    answer: "IDS detects and alerts on suspicious traffic (passive). IPS detects AND blocks inline. Examples: Snort/Suricata can do both depending on deployment.",
    difficulty: "easy", tags: ["IDS", "IPS"] },
  { id: "tool-3", category: "Security Tools", question: "What is a firewall vs a WAF?",
    answer: "Firewall = L3/L4 filtering by IP/port/protocol. WAF (Web Application Firewall) = L7 filtering of HTTP/HTTPS requests, blocking SQLi, XSS, etc. Both are needed.",
    difficulty: "easy", tags: ["Firewall", "WAF"] },
  { id: "tool-4", category: "Security Tools", question: "What does SOAR add on top of a SIEM?",
    answer: "Security Orchestration, Automation, and Response. Playbooks automate the boring stuff: enrich an IP, look up a hash, disable a user, open a ticket. Frees humans for real analysis.",
    difficulty: "medium", tags: ["SOAR"] },
  { id: "tool-5", category: "Security Tools", question: "What is a sandbox and why use one?",
    answer: "Isolated environment to detonate suspicious files/URLs and observe behavior safely. Examples: ANY.RUN, Joe Sandbox, Cuckoo, Hybrid-Analysis. Output: IOCs, behavior summary, screenshots.",
    difficulty: "easy", tags: ["Sandbox"] },
  { id: "tool-6", category: "Security Tools", question: "What does a proxy log give you that a firewall log doesn't?",
    answer: "URL paths, user-agent, response codes, and often the user/identity. Firewall logs usually only show IP/port. Proxy logs are critical for hunting web-based C2 and exfil.",
    difficulty: "medium", tags: ["Proxy"] },

  // ---------- Acronyms (in flashcards too, alongside dedicated drill) ----------
  { id: "ac-1", category: "Acronyms", question: "What does IOC stand for and what is an example?",
    answer: "Indicator of Compromise. Evidence that an attack happened or is happening. Examples: file hash, malicious IP/domain, registry key, suspicious filename.",
    difficulty: "easy", tags: ["IOC"] },
  { id: "ac-2", category: "Acronyms", question: "What does CVSS stand for?",
    answer: "Common Vulnerability Scoring System. A 0.0-10.0 score representing severity. Considers attack vector, complexity, privileges, user interaction, and impact.",
    difficulty: "easy", tags: ["CVSS"] },
  { id: "ac-3", category: "Acronyms", question: "What does C2 mean and how do you detect it?",
    answer: "Command and Control. Attacker's channel to talk to compromised hosts. Detect via beaconing patterns, weird DNS, traffic to known-bad infra, or non-standard ports.",
    difficulty: "easy", tags: ["C2"] },
  { id: "ac-4", category: "Acronyms", question: "What does DLP stand for and what does it do?",
    answer: "Data Loss Prevention. Tools that detect and block sensitive data (PII, credit cards, source code) from leaving the organization via email, USB, cloud upload, etc.",
    difficulty: "medium", tags: ["DLP"] },
  { id: "ac-5", category: "Acronyms", question: "PAM vs IAM?",
    answer: "IAM = Identity and Access Management for all users. PAM = Privileged Access Management, specifically for admin/service accounts with elevated rights (CyberArk, BeyondTrust, etc).",
    difficulty: "medium", tags: ["IAM", "PAM"] },
  { id: "ac-6", category: "Acronyms", question: "What does XDR mean?",
    answer: "Extended Detection and Response. EDR + telemetry from email, identity, cloud, and network in one platform. The 'extended' is about scope, not just endpoints.",
    difficulty: "medium", tags: ["XDR"] },

  // ---------- Detection Logic ----------
  { id: "det-1", category: "Detection Logic", question: "Signature-based vs behavior-based detection?",
    answer: "Signature = exact match (hash, regex, IOC). Fast and precise but easy to bypass. Behavior = pattern of activity (unusual parent-child process, unusual network volume). Catches unknowns but more FPs.",
    difficulty: "easy", tags: ["Detection"] },
  { id: "det-2", category: "Detection Logic", question: "What is the Pyramid of Pain?",
    answer: "Hierarchy showing how painful each IOC type is for an attacker to change. Bottom (easy for attackers): hashes, IPs. Middle: domains, network artifacts. Top (hardest): TTPs. Detect TTPs for durable value.",
    difficulty: "medium", tags: ["PyramidOfPain"] },
  { id: "det-3", category: "Detection Logic", question: "What is a detection rule's true positive rate vs false positive rate?",
    answer: "TPR = of all real threats, how many your rule caught. FPR = of all alerts your rule produced, how many were not threats. Good rules maximize TPR while keeping FPR low enough to investigate.",
    difficulty: "medium", tags: ["Tuning"] },
  { id: "det-4", category: "Detection Logic", question: "What is Sigma?",
    answer: "An open, generic detection rule format that can be converted to SIEM-specific queries (Splunk SPL, KQL, Elastic, etc). Lets the community share detections platform-agnostically.",
    difficulty: "medium", tags: ["Sigma"] },
  { id: "det-5", category: "Detection Logic", question: "What is a use case in detection engineering?",
    answer: "A documented scenario you want to detect, with: threat description, data sources required, logic, expected output, FP considerations, and response playbook reference.",
    difficulty: "medium", tags: ["UseCase"] },
  { id: "det-6", category: "Detection Logic", question: "Why do you need a baseline before detecting anomalies?",
    answer: "Without 'normal' you can't define 'abnormal'. Baselines help you say 'this user normally logs in from US M-F 9-5; a Saturday 2AM login from Brazil is abnormal'. Without baseline, everything is noise.",
    difficulty: "easy", tags: ["Baseline"] },
];

/* ============================================================
   2. ACRONYM DATA
   ============================================================ */
const acronyms = [
  { acronym: "SIEM",  meaning: "Security Information and Event Management", why_matters: "Central platform that aggregates and correlates logs to generate alerts. Where you live as an analyst." },
  { acronym: "SOC",   meaning: "Security Operations Center", why_matters: "The team/function that monitors and responds to threats 24/7." },
  { acronym: "EDR",   meaning: "Endpoint Detection and Response", why_matters: "Behavior-based detection + response actions on endpoints. Beyond signature AV." },
  { acronym: "IDS",   meaning: "Intrusion Detection System", why_matters: "Passively detects suspicious network traffic and alerts. Does not block." },
  { acronym: "IPS",   meaning: "Intrusion Prevention System", why_matters: "Inline detection + blocking. Same engine as IDS but stops the traffic." },
  { acronym: "IOC",   meaning: "Indicator of Compromise", why_matters: "Artifacts proving compromise: hashes, IPs, domains, filenames. Used to find more victims." },
  { acronym: "IOA",   meaning: "Indicator of Attack", why_matters: "Behavioral indicator that an attack is happening NOW, before payload is identified." },
  { acronym: "CVE",   meaning: "Common Vulnerabilities and Exposures", why_matters: "Unique ID for each public vulnerability. Tracks what to patch and which exploits are out there." },
  { acronym: "CVSS",  meaning: "Common Vulnerability Scoring System", why_matters: "0.0-10.0 severity score. Helps prioritize patching." },
  { acronym: "TTP",   meaning: "Tactics, Techniques, and Procedures", why_matters: "Adversary behavior model used in MITRE ATT&CK. Detecting TTPs is more durable than IOCs." },
  { acronym: "MFA",   meaning: "Multi-Factor Authentication", why_matters: "Single biggest control against credential theft. MFA fatigue attacks are the new trend." },
  { acronym: "ACL",   meaning: "Access Control List", why_matters: "Rules defining who can access what. Found on routers, firewalls, file systems." },
  { acronym: "DNS",   meaning: "Domain Name System", why_matters: "Resolves names to IPs. Heavily abused for C2, exfil, DGA, and tunneling." },
  { acronym: "DHCP",  meaning: "Dynamic Host Configuration Protocol", why_matters: "Hands out IP addresses on a LAN. DHCP logs help map IP->hostname at a given time." },
  { acronym: "SMB",   meaning: "Server Message Block", why_matters: "Windows file/printer sharing on port 445. Major lateral movement and ransomware vector." },
  { acronym: "RDP",   meaning: "Remote Desktop Protocol", why_matters: "Remote GUI to Windows on 3389. Constantly brute-forced; should never be on the internet." },
  { acronym: "SSH",   meaning: "Secure Shell", why_matters: "Encrypted remote shell on port 22. Brute force target on Linux/network gear." },
  { acronym: "HTTP",  meaning: "Hypertext Transfer Protocol", why_matters: "Cleartext web traffic on 80. Should rarely be seen in modern enterprises." },
  { acronym: "HTTPS", meaning: "HTTP over TLS", why_matters: "Encrypted web on 443. Visibility limited without TLS inspection - attackers exploit this." },
  { acronym: "TLS",   meaning: "Transport Layer Security", why_matters: "The encryption layer under HTTPS, SMTPS, IMAPS, etc. Older versions (1.0/1.1) are deprecated." },
  { acronym: "VPN",   meaning: "Virtual Private Network", why_matters: "Encrypted tunnel into a private network. Compromised VPN creds = full corporate access." },
  { acronym: "DLP",   meaning: "Data Loss Prevention", why_matters: "Detects and blocks sensitive data leaving the org (email, USB, cloud upload)." },
  { acronym: "IAM",   meaning: "Identity and Access Management", why_matters: "How identities are provisioned and granted access. Modern attacks target IAM (Azure AD, Okta)." },
  { acronym: "PAM",   meaning: "Privileged Access Management", why_matters: "Controls admin/service accounts with vault, session recording, just-in-time access." },
  { acronym: "XDR",   meaning: "Extended Detection and Response", why_matters: "EDR + email + identity + cloud + network correlated in one platform." },
  { acronym: "SOAR",  meaning: "Security Orchestration, Automation, and Response", why_matters: "Playbook engine that automates repetitive analyst tasks (enrichment, containment, ticketing)." },
];

/* ============================================================
   3. COMMAND DATA
   ============================================================ */
const commands = [
  // Linux
  { command: "ls", os: "linux", description: "List files in a directory.", why_soc: "Quick inspection of suspicious directories like /tmp, /var/tmp, /dev/shm.", example: "ls -la /tmp", suspicious: "Hidden files (.x), large unexpected binaries, files owned by www-data in /tmp." },
  { command: "cd", os: "linux", description: "Change directory.", why_soc: "Navigate to investigation paths during live response.", example: "cd /var/log", suspicious: "N/A by itself, but command history shows where an attacker poked around." },
  { command: "pwd", os: "linux", description: "Print working directory.", why_soc: "Confirm where you are before deleting or modifying.", example: "pwd", suspicious: "N/A." },
  { command: "cat", os: "linux", description: "Print file contents.", why_soc: "Read config files, logs, scripts.", example: "cat /etc/passwd", suspicious: "An attacker reading /etc/passwd, /etc/shadow, or .ssh/authorized_keys." },
  { command: "grep", os: "linux", description: "Search text using patterns.", why_soc: "Filter huge log files for specific patterns: IPs, usernames, error strings.", example: "grep -i 'failed' /var/log/auth.log", suspicious: "Attacker using grep to find creds in config files." },
  { command: "tail", os: "linux", description: "Show last N lines of a file; -f follows new lines.", why_soc: "Watch a log in real time while reproducing an incident.", example: "tail -f -n 100 /var/log/syslog", suspicious: "N/A." },
  { command: "head", os: "linux", description: "Show first N lines of a file.", why_soc: "Quickly check file headers / first entries.", example: "head -n 20 /var/log/auth.log", suspicious: "N/A." },
  { command: "chmod", os: "linux", description: "Change file permissions.", why_soc: "Spot files that were made world-writable or executable.", example: "chmod 755 script.sh", suspicious: "`chmod 777` on system files, or `chmod +x` on something downloaded from the internet." },
  { command: "chown", os: "linux", description: "Change file ownership.", why_soc: "Backdoor files re-owned to root for persistence.", example: "chown root:root /usr/bin/.x", suspicious: "Unexpected files owned by root in user-writable paths." },
  { command: "ps",    os: "linux", description: "Show running processes.", why_soc: "Identify suspicious processes, parents, and command lines.", example: "ps -ef --forest", suspicious: "Unusual parent-child (apache -> bash), processes from /tmp, base64-decoded commands." },
  { command: "top",   os: "linux", description: "Live process / resource usage.", why_soc: "Spot CPU spikes from cryptominers or runaway shells.", example: "top -c", suspicious: "Unknown process pinning 100% CPU (likely miner)." },
  { command: "netstat", os: "linux", description: "Show network connections, listening sockets, routing.", why_soc: "See what's listening and who's connected.", example: "netstat -tunap", suspicious: "Unknown listening port, connections to suspicious foreign IPs." },
  { command: "ss",    os: "linux", description: "Modern netstat replacement.", why_soc: "Fast view of TCP/UDP sockets with process info.", example: "ss -tunap", suspicious: "Same indicators as netstat; ss is preferred on modern systems." },
  { command: "ip a",  os: "linux", description: "Show network interfaces and IPs.", why_soc: "Verify host identity and detect rogue interfaces (e.g. unexpected VPN tun0).", example: "ip a", suspicious: "Unexpected tun/tap interfaces; promiscuous mode." },
  { command: "journalctl", os: "linux", description: "Query systemd journal logs.", why_soc: "Read service logs, auth events, kernel events with filters.", example: "journalctl -u ssh -S today", suspicious: "Service crashes, repeated auth failures, suspicious unit starts." },
  { command: "systemctl", os: "linux", description: "Manage systemd services and units.", why_soc: "Check service status, find malicious persistence units.", example: "systemctl list-unit-files --state=enabled", suspicious: "Enabled services in /etc/systemd/system with random names." },

  // Windows
  { command: "ipconfig", os: "windows", description: "Show IP configuration.", why_soc: "Quick host identity check.", example: "ipconfig /all", suspicious: "Unexpected DNS server set on the interface (DNS hijack)." },
  { command: "net user", os: "windows", description: "List or modify local users.", why_soc: "Spot new local accounts created by an attacker.", example: "net user", suspicious: "New accounts named 'admin', 'support', 'help', or random 8-char names." },
  { command: "net localgroup", os: "windows", description: "List or modify local groups.", why_soc: "Detect privilege escalation: new admins.", example: "net localgroup administrators", suspicious: "Non-admin users suddenly in Administrators group." },
  { command: "whoami", os: "windows", description: "Show current user, groups, privileges.", why_soc: "Confirm token context during IR or assess attacker reach.", example: "whoami /all", suspicious: "Standard user with SeDebug/SeImpersonate privileges (PrivEsc happened)." },
  { command: "tasklist", os: "windows", description: "List running processes.", why_soc: "Identify malicious processes when EDR is unavailable.", example: "tasklist /v", suspicious: "Processes from %TEMP%, %APPDATA%, or with random names; svchost not under services.exe." },
  { command: "taskkill", os: "windows", description: "Kill a process by PID or name.", why_soc: "Stop malware during containment.", example: "taskkill /F /PID 1234", suspicious: "Attacker killing AV/EDR processes." },
  { command: "netstat", os: "windows", description: "Show connections, listening ports, with PIDs.", why_soc: "Find what's talking out, then map to a process.", example: "netstat -ano", suspicious: "ESTABLISHED to foreign IP on non-standard port owned by an unusual process." },
  { command: "Get-Process", os: "windows", description: "PowerShell list of running processes.", why_soc: "Scriptable process enumeration with rich properties.", example: "Get-Process | Where Path -like '*Temp*'", suspicious: "Processes running from user-writable paths." },
  { command: "Get-Service", os: "windows", description: "PowerShell list of services and status.", why_soc: "Find malicious services (common persistence).", example: "Get-Service | Where Status -eq 'Running'", suspicious: "Service with random name, BinPath pointing to AppData or cmd.exe /c." },
  { command: "Get-EventLog", os: "windows", description: "Legacy event log query.", why_soc: "Quick pulls from Security/System/Application logs.", example: "Get-EventLog -LogName Security -Newest 50", suspicious: "Bursts of 4625 (failed logon), 4720 (user created), 4732 (added to local group)." },
  { command: "Get-WinEvent", os: "windows", description: "Modern event log query, supports all channels (e.g. Sysmon).", why_soc: "Filter rich event data with XPath/hashtable filters.", example: "Get-WinEvent -FilterHashtable @{LogName='Security';ID=4625} -MaxEvents 50", suspicious: "Filter spikes for IDs 4624/4625/4688/4720/4732/7045." },
];

/* ============================================================
   4. ALERT-TO-ACTION DATA
   ============================================================ */
const alerts = [
  { alert: "Multiple failed Windows logons",
    meaning: "Possible brute force or password spraying.",
    logs: "Windows Security log, Event ID 4625.",
    mitre: "T1110 - Brute Force.",
    checks: ["Which account(s) targeted?","Source IP / hostname?","How many attempts and over what time window?","Was there a successful 4624 from the same source afterward?","Is the account privileged? Is it a service account?"] },
  { alert: "Successful login after many failures",
    meaning: "Brute force succeeded OR user finally typed the right password.",
    logs: "4624 immediately following a cluster of 4625 from the same source.",
    mitre: "T1110 followed by T1078.",
    checks: ["Source IP - internal or external?","Logon type (3 network, 10 RDP)?","Account behavior after success - new processes, lateral movement?","Was MFA bypassed?","Disable account if unsure."] },
  { alert: "New local user created",
    meaning: "Possible attacker persistence or unauthorized admin action.",
    logs: "Event ID 4720 (user created); 4722 (enabled); 4738 (changed).",
    mitre: "T1136 - Create Account.",
    checks: ["Who created it (4720 'Subject' field)?","Is this a known admin / change ticket?","Was it added to Administrators (4732)?","Account name pattern (random / impersonating real user)?","Has the new account logged in or run anything yet?"] },
  { alert: "User added to local Administrators",
    meaning: "Privilege escalation - attacker or rogue admin granting persistence.",
    logs: "Event ID 4732 (member added to security-enabled local group).",
    mitre: "T1098 - Account Manipulation.",
    checks: ["Who performed the change? When?","Target account - is it suspicious or a real user?","Any approved change request?","Roll back if not approved, then investigate the actor."] },
  { alert: "Suspicious PowerShell execution",
    meaning: "Possible fileless malware, downloader, or living-off-the-land.",
    logs: "4688 / Sysmon 1 (process create); PowerShell Operational 4104 (script block).",
    mitre: "T1059.001 - PowerShell.",
    checks: ["Encoded command (-enc) - decode it.","Parent process - winword.exe / outlook.exe / unusual?","Network connections from powershell.exe?","Downloaded content from internet?","Run on multiple hosts simultaneously?"] },
  { alert: "Malware detected by AV/EDR",
    meaning: "Known-bad file identified; could be successful block or partial detonation.",
    logs: "EDR/AV console; corresponding 4688/Sysmon events.",
    mitre: "Varies - usually T1204 (User Execution) or T1059.",
    checks: ["Was it blocked or just detected?","Source - email attachment, USB, web download?","Other hosts with the same hash?","Parent process that delivered it?","Quarantined - confirm. If not, isolate host."] },
  { alert: "Unusual outbound connection",
    meaning: "Possible C2, exfil, or unauthorized tool.",
    logs: "Firewall / proxy logs; Sysmon 3 (network).",
    mitre: "T1071 - Application Layer Protocol; T1041 - Exfil over C2.",
    checks: ["Destination IP/domain reputation (VT, AbuseIPDB)?","Port and protocol unusual for this host?","Beaconing pattern (regular interval)?","Process initiating the connection?","Data volume - upload heavy?"] },
  { alert: "Port scan detected",
    meaning: "Reconnaissance - internal or external, targeting your hosts.",
    logs: "Firewall logs; IDS (Snort/Suricata) port-scan signatures.",
    mitre: "T1046 - Network Service Discovery.",
    checks: ["Source - external (likely background scan) or internal (worse)?","Internal source: compromised host doing recon for lateral movement.","Which ports / how many hosts?","Block the source if internal-to-internal scanning.","Correlate with any prior alerts on that source."] },
  { alert: "Impossible travel login",
    meaning: "Same user authenticated from two locations too far apart in too little time.",
    logs: "Azure AD / Okta sign-in logs; UEBA module.",
    mitre: "T1078.004 - Valid Accounts: Cloud.",
    checks: ["Is the user on a VPN? Mobile roaming?","Is one of the locations a known VPN/proxy?","Did MFA succeed for both logins?","Any risky actions after the suspicious login?","Force password reset + MFA challenge."] },
  { alert: "Suspicious scheduled task",
    meaning: "Persistence mechanism created or modified.",
    logs: "Event ID 4698 (task created), 4702 (updated); Sysmon 1.",
    mitre: "T1053.005 - Scheduled Task/Job.",
    checks: ["Task name and creator?","Action it runs - cmd.exe / powershell / unknown binary?","Trigger - on logon, daily, hourly?","Runs as SYSTEM?","Disable and review the binary before deleting."] },
  { alert: "Service created",
    meaning: "Common persistence; legitimate ones happen too - context matters.",
    logs: "Event ID 7045 (system); Sysmon 1 around the time.",
    mitre: "T1543.003 - Create or Modify System Process: Windows Service.",
    checks: ["Service name (random? mimicking real?)?","BinPath (system32, ProgramData, Temp, ADMIN$)?","Account it runs as (LocalSystem)?","Was sc.exe or PowerShell used? By whom?","Compare against known software install events."] },
  { alert: "Login from unusual country",
    meaning: "Geo-anomaly; could be travel, VPN, or compromise.",
    logs: "Cloud IdP sign-in logs; VPN logs.",
    mitre: "T1078 - Valid Accounts.",
    checks: ["Does the user have approved travel?","First time seeing this country for any user?","MFA used? From a known device?","Activity after sign-in (mail forwarding rules, file downloads)?","Block + reset if unverified."] },
  { alert: "DNS query to suspicious domain",
    meaning: "Possible C2 lookup, malware contact, or user landing on bad infra.",
    logs: "DNS resolver logs; proxy logs.",
    mitre: "T1071.004 - DNS; T1568 - Dynamic Resolution.",
    checks: ["Domain reputation / WHOIS age?","Which host(s) made the query? Which process?","Frequency - one-off or beaconing?","Did the resolution lead to an actual connection?","Sinkhole or block at DNS layer."] },
  { alert: "High number of blocked firewall events",
    meaning: "Either scanning into you, or a host trying to call out and getting denied.",
    logs: "Firewall deny logs.",
    mitre: "T1046 if scanning; T1071 if blocked egress.",
    checks: ["Inbound or outbound denies?","Outbound denies from a workstation = likely malware trying to reach C2.","Same destination / port repeatedly?","Which internal host is the source?","Investigate that endpoint."] },
  { alert: "Disabled security tool",
    meaning: "Attacker trying to evade defenses, or admin troubleshooting.",
    logs: "EDR/AV tamper events; Event ID 7036/7040 (service stopped); 1102 (Security log cleared).",
    mitre: "T1562 - Impair Defenses.",
    checks: ["Who disabled it (user / process)?","Was it stopped or uninstalled?","Other suspicious events immediately after?","Re-enable and isolate the host until cleared.","Was a security log cleared (Event 1102)? Treat as incident."] },
];

/* ============================================================
   5. STORAGE HELPERS
   ============================================================ */
const STORAGE = {
  MISSED: "soc_missed",      // [{ id, type, ts }]  type = 'flash' | 'acro' | 'cmd' | 'alert'
  STATS:  "soc_stats",       // { totalStudied, bestQuizScore, categoryMisses: {cat:n} }
  GOALS:  "soc_goals",       // { flashcards, quizAttempts, missedReview, acronymDrills, commandDrills, alertCards }
  SESSION: "soc_session",    // current session counter (ephemeral-ish)
};

const DEFAULT_GOALS = {
  flashcards: 15,
  quizAttempts: 1,
  missedReview: 10,
  acronymDrills: 5,
  commandDrills: 5,
  alertCards: 3,
};

const GOAL_LABELS = {
  flashcards: "Flashcards",
  quizAttempts: "Quiz Attempts",
  missedReview: "Missed Review",
  acronymDrills: "Acronym Drills",
  commandDrills: "Command Drills",
  alertCards: "Alert Cards",
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}
function saveJSON(key, obj) { localStorage.setItem(key, JSON.stringify(obj)); }

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `soc_daily_${y}-${m}-${day}`;
}
function todayLabel() { return todayKey().replace('soc_daily_',''); }

function getGoals() {
  const g = loadJSON(STORAGE.GOALS, null);
  if (!g) { saveJSON(STORAGE.GOALS, DEFAULT_GOALS); return { ...DEFAULT_GOALS }; }
  // ensure new keys exist if added later
  return { ...DEFAULT_GOALS, ...g };
}
function getDaily() {
  const empty = { flashcards: 0, quizAttempts: 0, missedReview: 0, acronymDrills: 0, commandDrills: 0, alertCards: 0 };
  return loadJSON(todayKey(), empty);
}
function bumpDaily(field, amount = 1) {
  const d = getDaily();
  d[field] = (d[field] || 0) + amount;
  saveJSON(todayKey(), d);
  renderDailySummaryAndGoals();
}
function getStats() {
  return loadJSON(STORAGE.STATS, { totalStudied: 0, bestQuizScore: null, categoryMisses: {} });
}
function bumpStats(updates) {
  const s = getStats();
  if (updates.totalStudied) s.totalStudied = (s.totalStudied || 0) + updates.totalStudied;
  if (updates.missedCategory) {
    s.categoryMisses[updates.missedCategory] = (s.categoryMisses[updates.missedCategory] || 0) + 1;
  }
  if (typeof updates.maybeBestQuiz === 'number') {
    if (s.bestQuizScore == null || updates.maybeBestQuiz > s.bestQuizScore) s.bestQuizScore = updates.maybeBestQuiz;
  }
  saveJSON(STORAGE.STATS, s);
}

function getMissed() { return loadJSON(STORAGE.MISSED, []); }
function addMissed(id, type) {
  const list = getMissed();
  if (!list.find(x => x.id === id && x.type === type)) {
    list.push({ id, type, ts: Date.now() });
    saveJSON(STORAGE.MISSED, list);
  }
}
function removeMissed(id, type) {
  const list = getMissed().filter(x => !(x.id === id && x.type === type));
  saveJSON(STORAGE.MISSED, list);
}

let SESSION_STREAK = 0;
function bumpSession() { SESSION_STREAK++; document.getElementById('stat-session').textContent = SESSION_STREAK; }

/* ============================================================
   6. TAB ROUTING
   ============================================================ */
function switchView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  const target = document.getElementById('view-' + name);
  if (target) target.classList.add('active');
  if (name === 'dashboard') renderDashboard();
  if (name === 'daily-goals') renderDailySummaryAndGoals();
  if (name === 'missed-review') startMissedReview();
}

document.getElementById('tab-nav').addEventListener('click', (e) => {
  if (e.target.matches('.tab-btn')) switchView(e.target.dataset.view);
});
document.body.addEventListener('click', (e) => {
  const jump = e.target.dataset?.jump;
  if (jump) switchView(jump);
});

/* ============================================================
   7. DASHBOARD
   ============================================================ */
function renderDashboard() {
  const stats = getStats();
  document.getElementById('stat-total').textContent = stats.totalStudied || 0;
  document.getElementById('stat-missed').textContent = getMissed().length;
  document.getElementById('stat-best').textContent = stats.bestQuizScore != null ? `${stats.bestQuizScore}%` : '--';
  document.getElementById('stat-session').textContent = SESSION_STREAK;

  // Weakest categories
  const misses = stats.categoryMisses || {};
  const list = document.getElementById('weak-list');
  const entries = Object.entries(misses).sort((a,b) => b[1] - a[1]).slice(0,5);
  if (!entries.length) {
    list.innerHTML = '<li class="muted">No data yet. Start studying to populate.</li>';
  } else {
    list.innerHTML = entries.map(([cat, count]) =>
      `<li><span>${cat}</span><span class="miss-count">${count} miss${count===1?'':'es'}</span></li>`
    ).join('');
  }

  // Daily summary mini
  const goals = getGoals();
  const daily = getDaily();
  const sum = document.getElementById('daily-summary');
  sum.innerHTML = Object.keys(DEFAULT_GOALS).map(k => {
    const done = (daily[k] || 0) >= goals[k];
    return `<div class="ds-item ${done?'done':''}">${GOAL_LABELS[k]}: ${daily[k]||0}/${goals[k]} ${done?'[COMPLETE]':''}</div>`;
  }).join('');
}

document.getElementById('reset-lifetime').addEventListener('click', () => {
  if (!confirm("This wipes ALL local progress (missed cards, stats, goals, daily progress). Continue?")) return;
  // wipe only our keys
  Object.values(STORAGE).forEach(k => localStorage.removeItem(k));
  // wipe any daily keys
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k && k.startsWith('soc_daily_')) localStorage.removeItem(k);
  }
  SESSION_STREAK = 0;
  alert("Local progress wiped.");
  renderDashboard();
  renderDailySummaryAndGoals();
});

/* ============================================================
   8. DAILY GOALS VIEW
   ============================================================ */
function renderDailySummaryAndGoals() {
  document.getElementById('daily-date-label').textContent = `[DATE] ${todayLabel()}`;
  const goals = getGoals();
  const daily = getDaily();

  // Goal rows
  const list = document.getElementById('goals-list');
  list.innerHTML = Object.keys(DEFAULT_GOALS).map(k => {
    const target = goals[k];
    const have = daily[k] || 0;
    const pct = target ? Math.min(100, Math.round((have/target)*100)) : 0;
    const done = have >= target;
    return `<div class="goal-row ${done?'complete':''}">
      <div class="goal-header">
        <span class="goal-name">&gt; ${GOAL_LABELS[k]} ${done?'<span class="complete-tag">[COMPLETE]</span>':''}</span>
        <span class="goal-progress">${have}/${target}</span>
      </div>
      <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');

  // Overall
  const totalTarget = Object.values(goals).reduce((a,b)=>a+b,0);
  const totalHave = Object.keys(DEFAULT_GOALS).reduce((a,k)=>a+Math.min(daily[k]||0, goals[k]),0);
  const pct = totalTarget ? Math.round((totalHave/totalTarget)*100) : 0;
  document.getElementById('overall-pct').textContent = pct + '%';
  document.getElementById('overall-bar').style.width = pct + '%';

  const allDone = Object.keys(DEFAULT_GOALS).every(k => (daily[k]||0) >= goals[k]);
  document.getElementById('all-complete-msg').classList.toggle('hidden', !allDone);

  // Edit inputs
  const edit = document.getElementById('goals-edit');
  edit.innerHTML = Object.keys(DEFAULT_GOALS).map(k =>
    `<label>${GOAL_LABELS[k]} target <input type="number" min="1" max="999" data-goal="${k}" value="${goals[k]}"></label>`
  ).join('');

  // Also refresh dashboard mini if visible
  if (document.getElementById('view-dashboard').classList.contains('active')) {
    // refresh the daily summary block on dashboard
    const sum = document.getElementById('daily-summary');
    sum.innerHTML = Object.keys(DEFAULT_GOALS).map(k => {
      const done = (daily[k] || 0) >= goals[k];
      return `<div class="ds-item ${done?'done':''}">${GOAL_LABELS[k]}: ${daily[k]||0}/${goals[k]} ${done?'[COMPLETE]':''}</div>`;
    }).join('');
  }
}
document.getElementById('save-goals').addEventListener('click', () => {
  const g = getGoals();
  document.querySelectorAll('#goals-edit input[data-goal]').forEach(inp => {
    const v = parseInt(inp.value,10);
    if (!isNaN(v) && v > 0) g[inp.dataset.goal] = v;
  });
  saveJSON(STORAGE.GOALS, g);
  renderDailySummaryAndGoals();
});
document.getElementById('reset-today').addEventListener('click', () => {
  if (!confirm("Reset today's progress to 0/X for every goal?")) return;
  localStorage.removeItem(todayKey());
  renderDailySummaryAndGoals();
});

/* ============================================================
   9. FLASHCARDS MODE
   ============================================================ */
let fc_deck = [];
let fc_idx = 0;
let fc_revealed = false;
let fc_category = "ALL";

function buildCategoryPicker() {
  const cats = ["ALL", ...Array.from(new Set(flashcards.map(c => c.category)))];
  document.getElementById('category-picker').innerHTML =
    cats.map(c => `<button class="${c===fc_category?'active':''}" data-cat="${c}">${c}</button>`).join('');
}
document.getElementById('category-picker').addEventListener('click', (e) => {
  if (!e.target.matches('button')) return;
  fc_category = e.target.dataset.cat;
  buildCategoryPicker();
  loadDeck();
});

function loadDeck() {
  fc_deck = (fc_category === 'ALL' ? flashcards.slice() : flashcards.filter(c => c.category === fc_category));
  // shuffle
  for (let i = fc_deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fc_deck[i], fc_deck[j]] = [fc_deck[j], fc_deck[i]];
  }
  fc_idx = 0;
  renderFlashcard();
}
function renderFlashcard() {
  if (!fc_deck.length) {
    document.getElementById('card-prompt').textContent = "No cards in this category.";
    document.getElementById('card-answer').classList.add('hidden');
    document.getElementById('card-count').textContent = "0 / 0";
    return;
  }
  const card = fc_deck[fc_idx];
  document.getElementById('card-category').textContent = card.category;
  document.getElementById('card-difficulty').textContent = card.difficulty || 'medium';
  document.getElementById('card-count').textContent = `${fc_idx+1} / ${fc_deck.length}`;
  document.getElementById('card-prompt').textContent = card.question;
  const ans = document.getElementById('card-answer');
  ans.textContent = card.answer;
  ans.classList.add('hidden');
  document.getElementById('card-tags').textContent = card.tags ? '#' + card.tags.join(' #') : '';
  fc_revealed = false;
  document.getElementById('got-it-btn').disabled = true;
  document.getElementById('missed-btn').disabled = true;
}
function revealFlashcard() {
  if (!fc_deck.length || fc_revealed) return;
  document.getElementById('card-answer').classList.remove('hidden');
  fc_revealed = true;
  document.getElementById('got-it-btn').disabled = false;
  document.getElementById('missed-btn').disabled = false;
}
function flashcardGotIt() {
  if (!fc_deck.length || !fc_revealed) return;
  const card = fc_deck[fc_idx];
  // if it was previously missed, remove from review queue
  removeMissed(card.id, 'flash');
  bumpStats({ totalStudied: 1 });
  bumpDaily('flashcards');
  bumpSession();
  nextFlashcard();
}
function flashcardMissedIt() {
  if (!fc_deck.length || !fc_revealed) return;
  const card = fc_deck[fc_idx];
  addMissed(card.id, 'flash');
  bumpStats({ totalStudied: 1, missedCategory: card.category });
  bumpDaily('flashcards');
  bumpSession();
  nextFlashcard();
}
function nextFlashcard() {
  if (!fc_deck.length) return;
  fc_idx = (fc_idx + 1) % fc_deck.length;
  renderFlashcard();
}
document.getElementById('reveal-btn').addEventListener('click', revealFlashcard);
document.getElementById('got-it-btn').addEventListener('click', flashcardGotIt);
document.getElementById('missed-btn').addEventListener('click', flashcardMissedIt);
document.getElementById('next-btn').addEventListener('click', nextFlashcard);

/* ============================================================
   10. QUIZ MODE
   ============================================================ */
let quiz_questions = [];
let quiz_idx = 0;
let quiz_score = 0;
let quiz_answered = false;
let quiz_missed = [];      // missed in this quiz
let quiz_lastCategory = "ALL";
let quiz_lastLength = 10;

function populateQuizCategorySelector() {
  const sel = document.getElementById('quiz-category');
  const cats = ["ALL", ...Array.from(new Set(flashcards.map(c => c.category)))];
  sel.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

function buildQuizPool(category, count, sourceCards) {
  // use sourceCards if provided (for retry-missed), else build from flashcards
  let pool = sourceCards
    ? sourceCards.slice()
    : (category === 'ALL' ? flashcards.slice() : flashcards.filter(c => c.category === category));

  // shuffle pool, slice count
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  pool = pool.slice(0, count);

  // build MCQs - 3 distractors from cards in same category (fallback: any other card)
  return pool.map(card => {
    const sameCat = flashcards.filter(c => c.category === card.category && c.id !== card.id);
    const otherCat = flashcards.filter(c => c.id !== card.id);
    const distractorPool = sameCat.length >= 3 ? sameCat : otherCat;
    // shuffle and pick 3
    const distractors = distractorPool.slice().sort(() => Math.random()-0.5).slice(0,3).map(c => c.answer);
    const options = distractors.concat([card.answer]);
    // shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return { card, options, correct: card.answer };
  });
}

function startQuiz(useMissedOnly = false) {
  const cat = document.getElementById('quiz-category').value;
  const len = parseInt(document.getElementById('quiz-length').value, 10);
  quiz_lastCategory = cat;
  quiz_lastLength = len;

  let source = null;
  if (useMissedOnly) {
    const missedIds = new Set(getMissed().filter(m => m.type === 'flash').map(m => m.id));
    source = flashcards.filter(c => missedIds.has(c.id));
    if (!source.length) { alert("No missed flashcards to retry."); return; }
  }

  quiz_questions = buildQuizPool(cat, useMissedOnly ? source.length : len, source);
  if (!quiz_questions.length) { alert("No questions available for that category."); return; }
  quiz_idx = 0;
  quiz_score = 0;
  quiz_answered = false;
  quiz_missed = [];
  document.getElementById('quiz-setup').classList.add('hidden');
  document.getElementById('quiz-results').classList.add('hidden');
  document.getElementById('quiz-active').classList.remove('hidden');
  renderQuizQuestion();
}
function renderQuizQuestion() {
  const q = quiz_questions[quiz_idx];
  document.getElementById('quiz-pos').textContent = `Q ${quiz_idx+1} / ${quiz_questions.length}`;
  document.getElementById('quiz-score').textContent = `SCORE: ${quiz_score}`;
  document.getElementById('quiz-question').textContent = q.card.question;
  const opts = document.getElementById('quiz-options');
  opts.innerHTML = q.options.map((o, i) =>
    `<button class="quiz-opt" data-opt="${i}">${String.fromCharCode(65+i)}) ${o}</button>`
  ).join('');
  document.getElementById('quiz-feedback').className = 'quiz-feedback';
  document.getElementById('quiz-feedback').textContent = '';
  document.getElementById('quiz-next').classList.add('hidden');
  quiz_answered = false;
}
document.getElementById('quiz-options').addEventListener('click', (e) => {
  if (!e.target.matches('.quiz-opt') || quiz_answered) return;
  quiz_answered = true;
  const idx = parseInt(e.target.dataset.opt, 10);
  const q = quiz_questions[quiz_idx];
  const chosenAnswer = q.options[idx];
  const isRight = chosenAnswer === q.correct;
  const fb = document.getElementById('quiz-feedback');

  document.querySelectorAll('.quiz-opt').forEach(btn => {
    btn.disabled = true;
    const text = btn.textContent.replace(/^[A-Z]\)\s/, '');
    if (q.options[parseInt(btn.dataset.opt,10)] === q.correct) btn.classList.add('correct');
    if (btn === e.target && !isRight) btn.classList.add('wrong');
  });

  if (isRight) {
    quiz_score++;
    fb.classList.add('show', 'right');
    fb.textContent = "> CORRECT.";
  } else {
    fb.classList.add('show', 'wrong');
    fb.textContent = `> INCORRECT. Correct answer: ${q.correct}`;
    quiz_missed.push(q.card);
    addMissed(q.card.id, 'flash');
    bumpStats({ missedCategory: q.card.category });
  }
  document.getElementById('quiz-score').textContent = `SCORE: ${quiz_score}`;
  document.getElementById('quiz-next').classList.remove('hidden');
});
document.getElementById('quiz-next').addEventListener('click', advanceQuiz);

function advanceQuiz() {
  if (!quiz_answered) return;
  if (quiz_idx + 1 >= quiz_questions.length) {
    finishQuiz();
  } else {
    quiz_idx++;
    renderQuizQuestion();
  }
}
function finishQuiz() {
  document.getElementById('quiz-active').classList.add('hidden');
  document.getElementById('quiz-results').classList.remove('hidden');
  const pct = Math.round((quiz_score / quiz_questions.length) * 100);
  document.getElementById('result-score').textContent = `${quiz_score} / ${quiz_questions.length}  (${pct}%)`;
  bumpStats({ maybeBestQuiz: pct });
  bumpDaily('quizAttempts');
  bumpSession();

  let summary = '';
  if (quiz_missed.length === 0) {
    summary = '> All correct. Clean run.';
  } else {
    summary = `> ${quiz_missed.length} missed question(s):\n\n`;
    quiz_missed.forEach((c, i) => {
      summary += `[${i+1}] (${c.category}) ${c.question}\n    -> ${c.answer}\n\n`;
    });
  }
  document.getElementById('result-summary').textContent = summary;
}
document.getElementById('start-quiz').addEventListener('click', () => startQuiz(false));
document.getElementById('new-quiz').addEventListener('click', () => {
  document.getElementById('quiz-results').classList.add('hidden');
  document.getElementById('quiz-setup').classList.remove('hidden');
});
document.getElementById('retry-missed').addEventListener('click', () => {
  if (!quiz_missed.length) { alert("No missed questions in the last quiz to retry."); return; }
  // build a quiz from this run's missed
  quiz_questions = buildQuizPool(null, quiz_missed.length, quiz_missed);
  quiz_idx = 0; quiz_score = 0; quiz_missed = []; quiz_answered = false;
  document.getElementById('quiz-results').classList.add('hidden');
  document.getElementById('quiz-active').classList.remove('hidden');
  renderQuizQuestion();
});

/* ============================================================
   11. ACRONYM DRILL
   ============================================================ */
let acro_deck = [], acro_idx = 0, acro_revealed = false;
function loadAcroDeck() {
  acro_deck = acronyms.slice().sort(() => Math.random() - 0.5);
  acro_idx = 0;
  renderAcro();
}
function renderAcro() {
  if (!acro_deck.length) return;
  const a = acro_deck[acro_idx];
  document.getElementById('acro-term').textContent = a.acronym;
  document.getElementById('acro-answer').innerHTML = `<strong>${a.meaning}</strong>\n\n${a.why_matters}`;
  document.getElementById('acro-answer').classList.add('hidden');
  document.getElementById('acro-count').textContent = `${acro_idx+1} / ${acro_deck.length}`;
  acro_revealed = false;
  document.getElementById('acro-got').disabled = true;
  document.getElementById('acro-missed').disabled = true;
}
document.getElementById('acro-reveal').addEventListener('click', () => {
  if (acro_revealed) return;
  document.getElementById('acro-answer').classList.remove('hidden');
  acro_revealed = true;
  document.getElementById('acro-got').disabled = false;
  document.getElementById('acro-missed').disabled = false;
});
document.getElementById('acro-got').addEventListener('click', () => {
  if (!acro_revealed) return;
  const a = acro_deck[acro_idx];
  removeMissed(a.acronym, 'acro');
  bumpStats({ totalStudied: 1 });
  bumpDaily('acronymDrills');
  bumpSession();
  acro_idx = (acro_idx + 1) % acro_deck.length;
  renderAcro();
});
document.getElementById('acro-missed').addEventListener('click', () => {
  if (!acro_revealed) return;
  const a = acro_deck[acro_idx];
  addMissed(a.acronym, 'acro');
  bumpStats({ totalStudied: 1, missedCategory: 'Acronyms' });
  bumpDaily('acronymDrills');
  bumpSession();
  acro_idx = (acro_idx + 1) % acro_deck.length;
  renderAcro();
});
document.getElementById('acro-next').addEventListener('click', () => {
  acro_idx = (acro_idx + 1) % acro_deck.length;
  renderAcro();
});

/* ============================================================
   12. COMMAND DRILL
   ============================================================ */
let cmd_deck = [], cmd_idx = 0, cmd_revealed = false, cmd_osFilter = 'all';
function loadCmdDeck() {
  cmd_deck = (cmd_osFilter === 'all' ? commands.slice() : commands.filter(c => c.os === cmd_osFilter));
  cmd_deck.sort(() => Math.random() - 0.5);
  cmd_idx = 0;
  renderCmd();
}
function renderCmd() {
  if (!cmd_deck.length) {
    document.getElementById('cmd-name').textContent = '--';
    document.getElementById('cmd-count').textContent = '0 / 0';
    return;
  }
  const c = cmd_deck[cmd_idx];
  document.getElementById('cmd-os').textContent = c.os.toUpperCase();
  document.getElementById('cmd-name').textContent = c.command;
  document.getElementById('cmd-answer').innerHTML =
    `<strong>What it does:</strong> ${c.description}\n\n` +
    `<strong>Why SOC cares:</strong> ${c.why_soc}\n\n` +
    `<strong>Example:</strong> ${c.example}\n\n` +
    `<strong>Suspicious behavior:</strong> ${c.suspicious}`;
  document.getElementById('cmd-answer').classList.add('hidden');
  document.getElementById('cmd-count').textContent = `${cmd_idx+1} / ${cmd_deck.length}`;
  cmd_revealed = false;
  document.getElementById('cmd-got').disabled = true;
  document.getElementById('cmd-missed').disabled = true;
}
document.getElementById('os-picker').addEventListener('click', (e) => {
  if (!e.target.matches('button[data-os]')) return;
  cmd_osFilter = e.target.dataset.os;
  document.querySelectorAll('#os-picker button').forEach(b => b.classList.toggle('active', b.dataset.os === cmd_osFilter));
  loadCmdDeck();
});
document.getElementById('cmd-reveal').addEventListener('click', () => {
  if (cmd_revealed) return;
  document.getElementById('cmd-answer').classList.remove('hidden');
  cmd_revealed = true;
  document.getElementById('cmd-got').disabled = false;
  document.getElementById('cmd-missed').disabled = false;
});
document.getElementById('cmd-got').addEventListener('click', () => {
  if (!cmd_revealed) return;
  const c = cmd_deck[cmd_idx];
  removeMissed(c.command, 'cmd');
  bumpStats({ totalStudied: 1 });
  bumpDaily('commandDrills');
  bumpSession();
  cmd_idx = (cmd_idx + 1) % cmd_deck.length;
  renderCmd();
});
document.getElementById('cmd-missed').addEventListener('click', () => {
  if (!cmd_revealed) return;
  const c = cmd_deck[cmd_idx];
  addMissed(c.command, 'cmd');
  bumpStats({ totalStudied: 1, missedCategory: 'Commands' });
  bumpDaily('commandDrills');
  bumpSession();
  cmd_idx = (cmd_idx + 1) % cmd_deck.length;
  renderCmd();
});
document.getElementById('cmd-next').addEventListener('click', () => {
  cmd_idx = (cmd_idx + 1) % cmd_deck.length;
  renderCmd();
});

/* ============================================================
   13. ALERT-TO-ACTION DRILL
   ============================================================ */
let al_deck = [], al_idx = 0, al_revealed = false;
function loadAlertDeck() {
  al_deck = alerts.slice().sort(() => Math.random() - 0.5);
  al_idx = 0;
  renderAlert();
}
function renderAlert() {
  if (!al_deck.length) return;
  const a = al_deck[al_idx];
  document.getElementById('alert-title').textContent = a.alert;
  document.getElementById('alert-answer').innerHTML =
    `<strong>Likely meaning:</strong> ${a.meaning}\n\n` +
    `<strong>Relevant logs:</strong> ${a.logs}\n\n` +
    `<strong>MITRE mapping:</strong> ${a.mitre}\n\n` +
    `<strong>First things to check:</strong>\n` + a.checks.map(c => '  - ' + c).join('\n');
  document.getElementById('alert-answer').classList.add('hidden');
  document.getElementById('alert-count').textContent = `${al_idx+1} / ${al_deck.length}`;
  al_revealed = false;
  document.getElementById('alert-got').disabled = true;
  document.getElementById('alert-missed').disabled = true;
}
document.getElementById('alert-reveal').addEventListener('click', () => {
  if (al_revealed) return;
  document.getElementById('alert-answer').classList.remove('hidden');
  al_revealed = true;
  document.getElementById('alert-got').disabled = false;
  document.getElementById('alert-missed').disabled = false;
});
document.getElementById('alert-got').addEventListener('click', () => {
  if (!al_revealed) return;
  const a = al_deck[al_idx];
  removeMissed(a.alert, 'alert');
  bumpStats({ totalStudied: 1 });
  bumpDaily('alertCards');
  bumpSession();
  al_idx = (al_idx + 1) % al_deck.length;
  renderAlert();
});
document.getElementById('alert-missed').addEventListener('click', () => {
  if (!al_revealed) return;
  const a = al_deck[al_idx];
  addMissed(a.alert, 'alert');
  bumpStats({ totalStudied: 1, missedCategory: 'Alerts' });
  bumpDaily('alertCards');
  bumpSession();
  al_idx = (al_idx + 1) % al_deck.length;
  renderAlert();
});
document.getElementById('alert-next').addEventListener('click', () => {
  al_idx = (al_idx + 1) % al_deck.length;
  renderAlert();
});

/* ============================================================
   14. MISSED REVIEW (THE CRITICAL LOOP)
   ============================================================ */
let mr_queue = []; // resolved { item, type, raw }
let mr_idx = 0;
let mr_revealed = false;

function resolveMissedItem(entry) {
  if (entry.type === 'flash') {
    const c = flashcards.find(f => f.id === entry.id);
    if (!c) return null;
    return { type: 'flash', raw: entry, prompt: c.question, answer: c.answer, label: c.category, id: c.id };
  }
  if (entry.type === 'acro') {
    const a = acronyms.find(x => x.acronym === entry.id);
    if (!a) return null;
    return { type: 'acro', raw: entry, prompt: `What does ${a.acronym} stand for and why does it matter?`,
      answer: `${a.meaning}\n\n${a.why_matters}`, label: 'ACRONYM', id: a.acronym };
  }
  if (entry.type === 'cmd') {
    const c = commands.find(x => x.command === entry.id);
    if (!c) return null;
    return { type: 'cmd', raw: entry, prompt: `What does \`${c.command}\` do, and what does suspicious use look like?`,
      answer: `${c.description}\n\nWhy SOC cares: ${c.why_soc}\nExample: ${c.example}\nSuspicious: ${c.suspicious}`,
      label: 'COMMAND - ' + c.os.toUpperCase(), id: c.command };
  }
  if (entry.type === 'alert') {
    const a = alerts.find(x => x.alert === entry.id);
    if (!a) return null;
    return { type: 'alert', raw: entry,
      prompt: `Alert: "${a.alert}". What does it mean and what do you check first?`,
      answer: `${a.meaning}\nLogs: ${a.logs}\nMITRE: ${a.mitre}\nChecks:\n  - ` + a.checks.join('\n  - '),
      label: 'ALERT', id: a.alert };
  }
  return null;
}

function startMissedReview() {
  const list = getMissed();
  mr_queue = list.map(resolveMissedItem).filter(Boolean);
  mr_idx = 0;
  document.getElementById('missed-count-line').textContent =
    mr_queue.length ? `> ${mr_queue.length} item(s) in review queue. Loop until you pass each one.` : '> Review queue is empty.';
  renderMissed();
}
function renderMissed() {
  const rev = document.getElementById('missed-reveal');
  const pass = document.getElementById('missed-pass');
  const keep = document.getElementById('missed-keep');
  if (!mr_queue.length) {
    document.getElementById('missed-type').textContent = '--';
    document.getElementById('missed-pos').textContent = '0 / 0';
    document.getElementById('missed-prompt').textContent = 'Your review queue is empty. Get some questions wrong first :)';
    document.getElementById('missed-answer').classList.add('hidden');
    rev.disabled = true; pass.disabled = true; keep.disabled = true;
    return;
  }
  rev.disabled = false;
  const cur = mr_queue[mr_idx];
  document.getElementById('missed-type').textContent = cur.label;
  document.getElementById('missed-pos').textContent = `${mr_idx+1} / ${mr_queue.length}`;
  document.getElementById('missed-prompt').textContent = cur.prompt;
  document.getElementById('missed-answer').innerHTML = cur.answer.replace(/\n/g, '<br>');
  document.getElementById('missed-answer').classList.add('hidden');
  mr_revealed = false;
  pass.disabled = true;
  keep.disabled = true;
}
document.getElementById('missed-reveal').addEventListener('click', () => {
  if (!mr_queue.length || mr_revealed) return;
  document.getElementById('missed-answer').classList.remove('hidden');
  mr_revealed = true;
  document.getElementById('missed-pass').disabled = false;
  document.getElementById('missed-keep').disabled = false;
});
document.getElementById('missed-pass').addEventListener('click', () => {
  if (!mr_queue.length || !mr_revealed) return;
  const cur = mr_queue[mr_idx];
  removeMissed(cur.id, cur.type);
  mr_queue.splice(mr_idx, 1);
  if (mr_idx >= mr_queue.length) mr_idx = 0;
  bumpDaily('missedReview');
  bumpSession();
  document.getElementById('missed-count-line').textContent =
    mr_queue.length ? `> ${mr_queue.length} item(s) remaining.` : '> Review queue cleared. Great work, analyst.';
  renderMissed();
});
document.getElementById('missed-keep').addEventListener('click', () => {
  if (!mr_queue.length || !mr_revealed) return;
  bumpDaily('missedReview');
  bumpSession();
  mr_idx = (mr_idx + 1) % mr_queue.length;
  renderMissed();
});
document.getElementById('missed-next').addEventListener('click', () => {
  if (!mr_queue.length) return;
  mr_idx = (mr_idx + 1) % mr_queue.length;
  renderMissed();
});
document.getElementById('clear-missed').addEventListener('click', () => {
  if (!confirm("Wipe the entire review queue?")) return;
  saveJSON(STORAGE.MISSED, []);
  startMissedReview();
});

/* ============================================================
   15. KEYBOARD SHORTCUTS
   ============================================================ */
document.addEventListener('keydown', (e) => {
  // ignore when typing in inputs / selects
  const t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return;

  const active = document.querySelector('.view.active');
  if (!active) return;
  const view = active.id.replace('view-', '');

  if (view === 'flashcards') {
    if (e.code === 'Space') { e.preventDefault(); revealFlashcard(); }
    else if (e.key === '1') { flashcardGotIt(); }
    else if (e.key === '2') { flashcardMissedIt(); }
    else if (e.key === 'Enter') { nextFlashcard(); }
  } else if (view === 'acronyms') {
    if (e.code === 'Space') { e.preventDefault(); document.getElementById('acro-reveal').click(); }
    else if (e.key === '1') { document.getElementById('acro-got').click(); }
    else if (e.key === '2') { document.getElementById('acro-missed').click(); }
    else if (e.key === 'Enter') { document.getElementById('acro-next').click(); }
  } else if (view === 'commands') {
    if (e.code === 'Space') { e.preventDefault(); document.getElementById('cmd-reveal').click(); }
    else if (e.key === '1') { document.getElementById('cmd-got').click(); }
    else if (e.key === '2') { document.getElementById('cmd-missed').click(); }
    else if (e.key === 'Enter') { document.getElementById('cmd-next').click(); }
  } else if (view === 'alerts') {
    if (e.code === 'Space') { e.preventDefault(); document.getElementById('alert-reveal').click(); }
    else if (e.key === '1') { document.getElementById('alert-got').click(); }
    else if (e.key === '2') { document.getElementById('alert-missed').click(); }
    else if (e.key === 'Enter') { document.getElementById('alert-next').click(); }
  } else if (view === 'missed-review') {
    if (e.code === 'Space') { e.preventDefault(); document.getElementById('missed-reveal').click(); }
    else if (e.key === '1') { document.getElementById('missed-pass').click(); }
    else if (e.key === '2') { document.getElementById('missed-keep').click(); }
    else if (e.key === 'Enter') { document.getElementById('missed-next').click(); }
  } else if (view === 'quiz') {
    if (e.key === 'Enter' && !document.getElementById('quiz-next').classList.contains('hidden')) advanceQuiz();
    // numeric 1-4 for answer
    const map = {'1':0,'2':1,'3':2,'4':3};
    if (map[e.key] != null) {
      const btn = document.querySelector(`.quiz-opt[data-opt="${map[e.key]}"]`);
      if (btn && !btn.disabled) btn.click();
    }
  }
});

/* ============================================================
   16. INIT
   ============================================================ */
function init() {
  buildCategoryPicker();
  loadDeck();
  populateQuizCategorySelector();
  loadAcroDeck();
  loadCmdDeck();
  loadAlertDeck();
  renderDashboard();
  renderDailySummaryAndGoals();
}
init();
