// CCNA 200-301 Study Notes — Exam Reference
// Derived from Jeremy's IT Lab CCNA 200-301 Complete Course

export const STUDY_NOTES = [
  {
    id: "quickref",
    title: "Quick Reference",
    color: "#00c896",
    sections: [
      {
        title: "OSI Model & PDUs",
        table: {
          headers: ["Layer", "Name", "PDU", "Key Protocols", "Device"],
          rows: [
            ["7", "Application", "Data", "HTTP, HTTPS, FTP, SSH, DNS, DHCP", "—"],
            ["6", "Presentation", "Data", "SSL/TLS, JPEG, ASCII", "—"],
            ["5", "Session", "Data", "SQL, NetBIOS, RPC", "—"],
            ["4", "Transport", "Segment / Datagram", "TCP, UDP", "—"],
            ["3", "Network", "Packet", "IPv4, IPv6, ICMP, OSPF", "Router"],
            ["2", "Data Link", "Frame", "Ethernet, 802.11, PPP", "Switch"],
            ["1", "Physical", "Bit", "Cables, signals, voltage", "Hub"],
          ]
        },
        bullets: [
          "Mnemonic (L7→L1): All People Seem To Need Data Processing",
          "Mnemonic (L1→L7): Please Do Not Throw Sausage Pizza Away",
          "TCP/IP model maps: Application (L7-5) | Transport (L4) | Internet (L3) | Network Access (L2-1)",
        ]
      },
      {
        title: "Well-Known Port Numbers",
        table: {
          headers: ["Protocol", "Port", "Transport", "Notes"],
          rows: [
            ["FTP Data", "20", "TCP", "Active data transfer"],
            ["FTP Control", "21", "TCP", "Commands"],
            ["SSH", "22", "TCP", "Encrypted management — use instead of Telnet"],
            ["Telnet", "23", "TCP", "Plaintext — NEVER use in production"],
            ["SMTP", "25", "TCP", "Email send"],
            ["DNS", "53", "UDP + TCP", "UDP for queries; TCP for zone transfers"],
            ["DHCP Server", "67", "UDP", "Server listens here"],
            ["DHCP Client", "68", "UDP", "Client listens here"],
            ["TFTP", "69", "UDP", "No auth — file transfers"],
            ["HTTP", "80", "TCP", "Web traffic"],
            ["NTP", "123", "UDP", "Time sync"],
            ["HTTPS", "443", "TCP", "Encrypted web"],
            ["SNMP", "161", "UDP", "Polling"],
            ["SNMP Trap", "162", "UDP", "Unsolicited alerts"],
            ["Syslog", "514", "UDP", "Log messages"],
            ["RADIUS Auth", "1812", "UDP", ""],
            ["RADIUS Acct", "1813", "UDP", ""],
            ["TACACS+", "49", "TCP", "Full encryption"],
          ]
        }
      },
      {
        title: "Administrative Distance (AD)",
        bullets: ["Lower AD = more trusted = installed in routing table when multiple sources exist"],
        table: {
          headers: ["Source", "AD"],
          rows: [
            ["Connected (C)", "0"],
            ["Static (S)", "1"],
            ["EIGRP internal (D)", "90"],
            ["OSPF (O)", "110"],
            ["RIP (R)", "120"],
            ["EIGRP external", "170"],
            ["Unknown / unreachable", "255"],
          ]
        }
      },
      {
        title: "Subnetting Quick Reference",
        bullets: [
          "Usable hosts = 2^(host bits) − 2",
          "Block size = 256 − interesting octet mask value",
          "Subnets start at 0 and increment by block size",
          "Network = first IP (host bits all 0) | Broadcast = last IP (host bits all 1)",
        ],
        table: {
          headers: ["Prefix", "Last Octet Mask", "Block Size", "Usable Hosts"],
          rows: [
            ["/24", "0", "256", "254"],
            ["/25", "128", "128", "126"],
            ["/26", "192", "64", "62"],
            ["/27", "224", "32", "30"],
            ["/28", "240", "16", "14"],
            ["/29", "248", "8", "6"],
            ["/30", "252", "4", "2"],
            ["/31", "254", "2", "0 (point-to-point only)"],
            ["/32", "255", "1", "0 (host route)"],
          ]
        }
      },
      {
        title: "IPv4 Protocol Numbers",
        table: {
          headers: ["Value", "Protocol"],
          rows: [
            ["1", "ICMP"],
            ["6", "TCP"],
            ["17", "UDP"],
            ["89", "OSPF"],
          ]
        }
      },
      {
        title: "Top 10 Exam Focus Areas",
        bullets: [
          "1. Subnetting — practice until under 30 seconds per question",
          "2. OSPF — neighbor states, DR/BDR election, cost calculation",
          "3. VLANs — access/trunk config, inter-VLAN routing (all 3 methods)",
          "4. STP/RSTP — port roles, states, PortFast + BPDU Guard",
          "5. ACLs — standard near destination, extended near source",
          "6. IPv6 — GUA, link-local, SLAAC, EUI-64, NDP",
          "7. Layer 2 security — Port Security, DHCP Snooping, DAI",
          "8. Wireless — 802.11 standards, WPA2/WPA3, WLC/CAPWAP",
          "9. Automation — Ansible vs Puppet/Chef, REST API methods, JSON/YAML",
          "10. CLI proficiency — practice configs in Packet Tracer",
        ]
      }
    ]
  },

  {
    id: "routing",
    title: "Routing",
    color: "#7c6df0",
    sections: [
      {
        title: "Routing Table Codes",
        table: {
          headers: ["Code", "Source", "AD"],
          rows: [
            ["C", "Connected interface subnet", "0"],
            ["L", "Local — router's own /32 IP", "0"],
            ["S", "Static route", "1"],
            ["D", "EIGRP", "90"],
            ["O", "OSPF", "110"],
            ["R", "RIP", "120"],
          ]
        },
        bullets: [
          "Longest prefix match wins when multiple routes match a destination",
          "/24 beats /16 beats /0 — most specific route is always preferred",
          "Routing is bidirectional — configure routes in BOTH directions",
        ]
      },
      {
        title: "Static Route Configuration",
        code: `! Next-hop IP (most common for Ethernet)
R1(config)# ip route 192.168.2.0 255.255.255.0 10.0.0.2

! Exit interface + next-hop (best practice for Ethernet)
R1(config)# ip route 192.168.2.0 255.255.255.0 GigabitEthernet0/1 10.0.0.2

! Default route (gateway of last resort)
R1(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1

! Floating static backup (AD higher than dynamic protocol)
R1(config)# ip route 192.168.2.0 255.255.255.0 10.0.0.5 115

! Verify
R1# show ip route
R1# show ip route static`
      },
      {
        title: "OSPF Overview",
        bullets: [
          "Link-State protocol — each router builds complete topology map (LSDB)",
          "Dijkstra SPF algorithm calculates shortest path",
          "Metric = Cost (Reference BW / Interface BW)",
          "AD = 110 | Open standard (RFC 2328)",
          "Multicast: 224.0.0.5 (all OSPF routers) | 224.0.0.6 (DR/BDR)",
        ]
      },
      {
        title: "OSPF Cost",
        bullets: [
          "Cost = Reference Bandwidth / Interface Bandwidth",
          "Default reference BW = 100 Mbps → all links ≥ 100M get cost 1 (WRONG!)",
          "Fix: set reference BW to 10000 (10 Gbps) on ALL routers in the domain",
        ],
        table: {
          headers: ["Interface Speed", "Default Cost (ref 100M)", "Better Cost (ref 10G)"],
          rows: [
            ["10 Mbps", "100", "1000"],
            ["100 Mbps", "1", "100"],
            ["1 Gbps", "1 ← same as 100M!", "10"],
            ["10 Gbps", "1 ← same as 100M!", "1"],
          ]
        },
        code: `! Fix reference bandwidth (do on ALL routers!)
R1(config-router)# auto-cost reference-bandwidth 10000

! Or set cost directly on interface
R1(config-if)# ip ospf cost 10`
      },
      {
        title: "OSPF Neighbor States",
        bullets: [
          "Down → Init → 2-Way → ExStart → Exchange → Loading → Full",
          "Full = fully synchronized — what you want to see",
          "2-Way = DROthers with each other on broadcast segments (normal)",
          "Stuck in Exstart/Exchange = MTU mismatch",
          "Stuck in Loading = LSDB issue",
        ]
      },
      {
        title: "OSPF Neighbor Requirements",
        bullets: [
          "1. Same subnet (directly connected)",
          "2. Same OSPF area number",
          "3. Matching Hello/Dead timers (default: Hello 10s / Dead 40s)",
          "4. Unique Router ID",
          "5. Matching authentication (if configured)",
          "6. Matching MTU (ip ospf mtu-ignore to override)",
        ]
      },
      {
        title: "OSPF DR/BDR Election",
        bullets: [
          "Highest OSPF priority wins → default priority = 1",
          "Tie-breaker: highest Router ID",
          "Priority 0 = never elected as DR or BDR",
          "Election is NON-preemptive — reboot to change DR",
          "Only on multi-access networks (Ethernet) — not on point-to-point",
          "DROthers form Full adjacency ONLY with DR and BDR",
        ]
      },
      {
        title: "Router ID Selection (Priority Order)",
        bullets: [
          "1. Manually configured: router-id x.x.x.x ← always use this",
          "2. Highest loopback interface IP",
          "3. Highest active physical interface IP",
        ]
      },
      {
        title: "OSPF Configuration",
        code: `R1(config)# router ospf 1
R1(config-router)# router-id 1.1.1.1
R1(config-router)# auto-cost reference-bandwidth 10000
R1(config-router)# network 192.168.1.0 0.0.0.255 area 0
R1(config-router)# passive-interface GigabitEthernet0/0
R1(config-router)# default-information originate

! Per-interface (preferred over network command)
R1(config-if)# ip ospf 1 area 0
R1(config-if)# ip ospf priority 100
R1(config-if)# ip ospf cost 10

! Verification
R1# show ip ospf neighbor
R1# show ip ospf interface brief
R1# show ip ospf database
R1# show ip route ospf`
      },
      {
        title: "FHRP Comparison (HSRP / VRRP / GLBP)",
        bullets: [
          "FHRPs create a virtual IP shared by multiple routers — transparent failover for hosts",
          "Failover: new Active router sends Gratuitous ARP to update switch MAC tables",
        ],
        table: {
          headers: ["Feature", "HSRP", "VRRP", "GLBP"],
          rows: [
            ["Standard", "Cisco proprietary", "IEEE open standard", "Cisco proprietary"],
            ["Active gateways", "1 Active", "1 Master", "Up to 4 (load balances!)"],
            ["Default priority", "100", "100", "100"],
            ["Preemption default", "Off", "On", "Off"],
            ["Load balancing", "No", "No", "Yes"],
          ]
        },
        code: `! HSRP Configuration
R1(config-if)# standby version 2
R1(config-if)# standby 1 ip 192.168.1.1
R1(config-if)# standby 1 priority 150
R1(config-if)# standby 1 preempt
R1(config-if)# standby 1 track GigabitEthernet0/1 60

R1# show standby brief`
      },
    ]
  },

  {
    id: "switching",
    title: "Switching & VLANs",
    color: "#f59e0b",
    sections: [
      {
        title: "Switch MAC Learning & Forwarding",
        bullets: [
          "Learning: reads SOURCE MAC of incoming frames → adds to MAC table",
          "Forwarding: reads DESTINATION MAC → looks up in MAC table → forwards",
          "Unknown unicast: destination not in table → FLOOD all ports except ingress",
          "Broadcast (FF:FF:FF:FF:FF:FF): always flooded out all ports except ingress",
          "Default MAC aging time: 300 seconds (5 minutes)",
        ],
        code: `SW1# show mac address-table
SW1# clear mac address-table dynamic`
      },
      {
        title: "Ethernet Frame Structure",
        table: {
          headers: ["Field", "Size", "Purpose"],
          rows: [
            ["Preamble", "7 bytes", "Clock synchronization"],
            ["SFD", "1 byte", "Start of Frame Delimiter"],
            ["Destination MAC", "6 bytes", "Where to send"],
            ["Source MAC", "6 bytes", "Where it came from"],
            ["EtherType / Length", "2 bytes", "0x0800=IPv4, 0x0806=ARP, 0x86DD=IPv6"],
            ["Payload", "46–1500 bytes", "Data (padding to 46 bytes minimum)"],
            ["FCS", "4 bytes", "CRC error detection — bad frames dropped"],
          ]
        },
        bullets: [
          "Minimum frame size: 64 bytes | Maximum: 1518 bytes (1522 with 802.1Q tag)",
          "802.1Q tag = 4 bytes: TPID (0x8100) + PCP (3b) + DEI (1b) + VID (12b)",
          "VID = 12 bits → supports VLANs 0–4095 (4096 total)",
        ]
      },
      {
        title: "VLAN Configuration",
        code: `! Create VLAN
SW1(config)# vlan 10
SW1(config-vlan)# name Finance

! Access port — single VLAN, untagged
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10

! Trunk port — multiple VLANs, tagged
SW1(config-if)# switchport trunk encapsulation dot1q   ! Required on older switches
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport trunk native vlan 999       ! Change from VLAN 1 for security
SW1(config-if)# switchport trunk allowed vlan 10,20,30
SW1(config-if)# switchport trunk allowed vlan add 40   ! Add without removing others
SW1(config-if)# switchport nonegotiate                 ! Disable DTP for security

! Verify
SW1# show vlan brief
SW1# show interfaces trunk`
      },
      {
        title: "Inter-VLAN Routing Methods",
        table: {
          headers: ["Method", "Pros", "Cons"],
          rows: [
            ["Separate router interfaces", "Simple", "1 physical interface per VLAN — not scalable"],
            ["Router-on-a-Stick (ROAS)", "One trunk to router", "Single link bottleneck"],
            ["Layer 3 Switch SVIs", "Fast, scalable, best practice", "Higher cost switch required"],
          ]
        },
        code: `! ROAS — router sub-interfaces
R1(config)# interface GigabitEthernet0/0
R1(config-if)# no shutdown
R1(config)# interface GigabitEthernet0/0.10
R1(config-subif)# encapsulation dot1q 10
R1(config-subif)# ip address 192.168.10.1 255.255.255.0

! Layer 3 Switch SVIs — best practice
SW1(config)# ip routing
SW1(config)# interface vlan 10
SW1(config-if)# ip address 192.168.10.1 255.255.255.0
SW1(config-if)# no shutdown`
      },
      {
        title: "DTP Trunk Modes",
        table: {
          headers: ["Mode", "Behavior"],
          rows: [
            ["dynamic auto", "Passive — trunks only if neighbor initiates"],
            ["dynamic desirable", "Active — tries to form a trunk"],
            ["trunk", "Always trunk regardless of neighbor"],
            ["access", "Always access port"],
            ["nonegotiate", "Disable DTP — use on all access ports"],
          ]
        },
        bullets: [
          "dynamic auto + dynamic auto = access (neither initiates) — common exam trap!",
          "dynamic desirable + dynamic auto = trunk",
        ]
      },
      {
        title: "Spanning Tree Protocol (STP)",
        bullets: [
          "Prevents Layer 2 loops which cause broadcast storms — network unusable in seconds",
          "Election: 1) Root Bridge (lowest BID) → 2) Root Ports → 3) Designated Ports → 4) Block rest",
          "Bridge ID (BID) = Priority (4096 multiples, default 32768) + MAC address",
        ],
        table: {
          headers: ["Port Role", "Description"],
          rows: [
            ["Root Port (RP)", "Best path to Root Bridge — one per non-root switch"],
            ["Designated Port (DP)", "Best port on each segment toward Root — forwards traffic"],
            ["Alternate Port (AP)", "Blocked — backup path to Root (RSTP term)"],
          ]
        }
      },
      {
        title: "STP Port States (802.1D Classic)",
        table: {
          headers: ["State", "Duration", "Learns MACs?", "Forwards Frames?"],
          rows: [
            ["Blocking", "Indefinite", "No", "No"],
            ["Listening", "15 seconds", "No", "No"],
            ["Learning", "15 seconds", "Yes", "No"],
            ["Forwarding", "Indefinite", "Yes", "Yes"],
          ]
        },
        bullets: [
          "Classic STP convergence: 30–50 seconds total",
          "RSTP (802.1w) states: Discarding / Learning / Forwarding → converges in ~1-2 seconds",
          "PortFast: skips listening/learning for access ports — connects immediately",
          "BPDU Guard: err-disables a PortFast port if it receives a BPDU — prevents rogue switches",
          "Always pair PortFast + BPDU Guard on all end-device ports",
        ],
        code: `! STP configuration
SW1(config)# spanning-tree vlan 1 root primary
SW1(config)# spanning-tree vlan 1 priority 4096    ! Must be multiple of 4096

! Access port best practices
SW1(config-if)# spanning-tree portfast
SW1(config-if)# spanning-tree bpduguard enable

! Global PortFast + BPDU Guard
SW1(config)# spanning-tree portfast default
SW1(config)# spanning-tree portfast bpduguard default

SW1# show spanning-tree vlan 1`
      },
      {
        title: "STP Path Cost Values",
        table: {
          headers: ["Interface Speed", "STP Cost"],
          rows: [
            ["10 Mbps", "100"],
            ["100 Mbps", "19"],
            ["1 Gbps", "4"],
            ["10 Gbps", "2"],
          ]
        }
      },
      {
        title: "EtherChannel",
        bullets: [
          "Bundles multiple physical links into one logical link — STP sees it as ONE link",
          "All physical links are active (no blocking) — increases bandwidth AND redundancy",
          "All member ports MUST match: speed, duplex, VLAN config, switchport mode",
          "Configure trunk/access settings on port-channel interface, not physical ports",
        ],
        table: {
          headers: ["Protocol", "Standard", "Modes", "Combination to Form Bundle"],
          rows: [
            ["LACP", "IEEE 802.3ad (open)", "Active / Passive", "Active+Active or Active+Passive"],
            ["PAgP", "Cisco proprietary", "Desirable / Auto", "Desirable+Desirable or Desirable+Auto"],
            ["Static", "N/A", "On / On", "Both must be 'on' — no negotiation"],
          ]
        },
        code: `! LACP (recommended — open standard)
SW1(config)# interface range GigabitEthernet0/1 - 3
SW1(config-if-range)# channel-group 1 mode active

! Configure the logical interface (NOT the physical ports!)
SW1(config)# interface port-channel 1
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport trunk allowed vlan 10,20

SW1# show etherchannel summary`
      }
    ]
  },

  {
    id: "security",
    title: "Security",
    color: "#f43f5e",
    sections: [
      {
        title: "ACL Types & Placement Rule",
        bullets: [
          "ACEs processed TOP-TO-BOTTOM — first match wins, processing stops",
          "Implicit deny any at end — invisible but always present",
        ],
        table: {
          headers: ["Type", "Matches On", "Numbered Range", "Placement Rule"],
          rows: [
            ["Standard", "Source IP only", "1–99, 1300–1999", "Place NEAR DESTINATION (can't filter by dest, so apply close to where traffic goes)"],
            ["Extended", "Src IP, Dst IP, Protocol, Port", "100–199, 2000–2699", "Place NEAR SOURCE (drop traffic early to save bandwidth)"],
          ]
        }
      },
      {
        title: "ACL Wildcard Masks",
        bullets: [
          "Wildcard mask: 0 = must match, 1 = don't care (opposite of subnet mask)",
          "host 10.0.0.1 = 10.0.0.1 0.0.0.0 (match exactly one host)",
          "any = 0.0.0.0 255.255.255.255 (match any address)",
          "Port operators: eq (=), ne (≠), gt (>), lt (<), range (inclusive range)",
        ]
      },
      {
        title: "ACL Configuration",
        code: `! Standard named ACL
R1(config)# ip access-list standard BLOCK_HOST
R1(config-std-nacl)# 10 permit host 192.168.1.10
R1(config-std-nacl)# 20 deny 10.0.0.0 0.255.255.255
R1(config-std-nacl)# 30 permit any
R1(config-if)# ip access-group BLOCK_HOST out      ! outbound from interface

! Extended named ACL
R1(config)# ip access-list extended OFFICE_POLICY
R1(config-ext-nacl)# 10 permit tcp 192.168.1.0 0.0.0.255 any eq 80
R1(config-ext-nacl)# 20 permit tcp 192.168.1.0 0.0.0.255 any eq 443
R1(config-ext-nacl)# 30 permit udp any any eq 53
R1(config-ext-nacl)# 40 permit icmp any any
R1(config-ext-nacl)# 50 deny ip any any log
R1(config-if)# ip access-group OFFICE_POLICY in    ! inbound to interface

R1# show ip access-lists`
      },
      {
        title: "Port Security Violation Modes",
        table: {
          headers: ["Mode", "Action on Violation", "Syslog?", "Port Status"],
          rows: [
            ["shutdown (default)", "Err-disables the port", "Yes", "err-disabled — must manually recover"],
            ["restrict", "Drop violating frames", "Yes", "Stays up — traffic from valid MACs continues"],
            ["protect", "Drop violating frames silently", "No", "Stays up — no log generated"],
          ]
        },
        code: `SW1(config-if)# switchport mode access
SW1(config-if)# switchport port-security
SW1(config-if)# switchport port-security maximum 2
SW1(config-if)# switchport port-security violation shutdown
SW1(config-if)# switchport port-security mac-address sticky   ! Learn + save to config

SW1# show port-security interface FastEthernet0/1

! Recover err-disabled port
SW1(config-if)# shutdown
SW1(config-if)# no shutdown`
      },
      {
        title: "DHCP Snooping",
        bullets: [
          "Prevents rogue DHCP servers — classifies switch ports as trusted or untrusted",
          "Trusted ports: DHCP Offer/ACK allowed — use on uplinks and DHCP server ports",
          "Untrusted ports: client messages only — DHCP Offer/ACK from untrusted = DROP",
          "Builds binding table (IP→MAC→port→VLAN) used by DAI",
        ],
        code: `SW1(config)# ip dhcp snooping
SW1(config)# ip dhcp snooping vlan 10,20
SW1(config-if)# ip dhcp snooping trust          ! On uplinks and DHCP server port
SW1(config-if)# ip dhcp snooping limit rate 15  ! Rate limit on untrusted ports

SW1# show ip dhcp snooping binding`
      },
      {
        title: "Dynamic ARP Inspection (DAI)",
        bullets: [
          "Validates ARP packets against DHCP Snooping binding table",
          "Drops ARP where IP→MAC mapping doesn't match the binding table",
          "Prevents ARP spoofing / MITM attacks",
          "Requires DHCP Snooping to be configured first",
          "For static IP devices, create ARP ACL to bypass binding table check",
        ],
        code: `SW1(config)# ip arp inspection vlan 10,20
SW1(config-if)# ip arp inspection trust   ! On trusted uplinks only

! For devices with static IPs (not in DHCP snooping table)
SW1(config)# arp access-list STATIC_HOSTS
SW1(config-arp-nacl)# permit ip host 192.168.1.1 mac host AAAA.AAAA.AAAA
SW1(config)# ip arp inspection filter STATIC_HOSTS vlan 10

SW1# show ip arp inspection`
      },
      {
        title: "SSH Configuration (Required Steps in Order)",
        bullets: [
          "Step 1: Set a non-default hostname",
          "Step 2: Configure a domain name",
          "Step 3: Generate RSA keys (modulus 2048 minimum)",
          "Step 4: Enable SSH version 2",
          "Step 5: Create local user with privilege 15",
          "Step 6: Configure VTY lines — login local + transport input ssh",
        ],
        code: `SW1(config)# hostname SW1
SW1(config)# ip domain-name cisco.com
SW1(config)# crypto key generate rsa modulus 2048
SW1(config)# ip ssh version 2
SW1(config)# username admin privilege 15 secret StrongPass!
SW1(config)# line vty 0 15
SW1(config-line)# login local
SW1(config-line)# transport input ssh       ! Block Telnet
SW1(config-line)# exec-timeout 10 0

SW1# show ip ssh
SW1# show ssh`
      },
      {
        title: "Device Hardening",
        code: `R1(config)# enable secret StrongPass!          ! MD5 hashed — always use over 'enable password'
R1(config)# service password-encryption        ! Encrypt Type 7 (weak but better than plaintext)
R1(config)# security passwords min-length 10
R1(config)# login block-for 120 attempts 5 within 60   ! Lockout after 5 failures in 60s
R1(config)# no ip http server                  ! Disable HTTP management
R1(config)# no ip domain-lookup               ! Prevent DNS lookup on typos
R1(config)# banner motd # Authorized access only! #`
      },
      {
        title: "AAA — Authentication, Authorization, Accounting",
        bullets: [
          "Authentication: Who are you? (verify identity)",
          "Authorization: What can you do? (allowed commands/resources)",
          "Accounting: What did you do? (audit logging)",
        ],
        table: {
          headers: ["Protocol", "Transport", "Encrypts", "Standard"],
          rows: [
            ["RADIUS", "UDP 1812/1813", "Password only", "Open — supported by all vendors"],
            ["TACACS+", "TCP 49", "Entire payload", "Cisco — separates auth/authz/acct"],
          ]
        }
      },
      {
        title: "Common Layer 2 Attacks",
        table: {
          headers: ["Attack", "Description", "Mitigation"],
          rows: [
            ["MAC flooding", "Fill MAC table → switch floods all frames", "Port Security"],
            ["DHCP starvation", "Exhaust DHCP pool with fake requests", "DHCP Snooping"],
            ["DHCP spoofing", "Rogue DHCP server → MITM", "DHCP Snooping (trusted ports)"],
            ["ARP spoofing", "Poison ARP caches → MITM", "Dynamic ARP Inspection (DAI)"],
            ["VLAN hopping", "Exploit DTP or native VLAN", "Disable DTP, change native VLAN"],
            ["STP manipulation", "Forge BPDUs → become root bridge", "BPDU Guard, Root Guard"],
          ]
        }
      }
    ]
  },

  {
    id: "services",
    title: "Network Services",
    color: "#f97316",
    sections: [
      {
        title: "DHCP — DORA Process",
        bullets: [
          "Discover: client broadcasts (Src: 0.0.0.0, Dst: 255.255.255.255)",
          "Offer: server unicasts an IP offer to client",
          "Request: client broadcasts acceptance (notifies all DHCP servers)",
          "Acknowledge: server confirms the assignment",
          "UDP 67 (server listens) / UDP 68 (client listens)",
        ],
        code: `! Exclude addresses first, then create pool
R1(config)# ip dhcp excluded-address 192.168.1.1 192.168.1.10
R1(config)# ip dhcp pool LAN_POOL
R1(dhcp-config)# network 192.168.1.0 255.255.255.0
R1(dhcp-config)# default-router 192.168.1.1
R1(dhcp-config)# dns-server 8.8.8.8
R1(dhcp-config)# lease 7

! DHCP Relay — forward client broadcasts to remote DHCP server
R1(config-if)# ip helper-address 10.0.0.100

R1# show ip dhcp binding
R1# show ip dhcp pool`
      },
      {
        title: "NAT / PAT Types",
        table: {
          headers: ["Type", "Mapping", "Use Case"],
          rows: [
            ["Static NAT", "1 private ↔ 1 public (permanent)", "Servers needing a fixed public IP"],
            ["Dynamic NAT", "Many private → pool of public IPs", "Temporary outbound access"],
            ["PAT (Overload)", "Many private → 1 public IP (port-based)", "Home/office internet — most common"],
          ]
        },
        code: `! PAT (most common configuration)
R1(config)# access-list 1 permit 192.168.1.0 0.0.0.255
R1(config)# ip nat inside source list 1 interface GigabitEthernet0/1 overload

R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip nat inside
R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip nat outside

R1# show ip nat translations
R1# show ip nat statistics`
      },
      {
        title: "DNS Record Types",
        table: {
          headers: ["Record", "Purpose"],
          rows: [
            ["A", "Hostname → IPv4 address"],
            ["AAAA", "Hostname → IPv6 address"],
            ["CNAME", "Alias → canonical name"],
            ["MX", "Mail exchanger for a domain"],
            ["PTR", "IP → Hostname (reverse lookup)"],
          ]
        },
        bullets: [
          "DNS uses UDP 53 (queries) and TCP 53 (zone transfers / large responses)",
        ]
      },
      {
        title: "NTP — Network Time Protocol",
        bullets: [
          "NTP UDP port 123",
          "Stratum 0 = atomic clock (reference, not on network)",
          "Stratum 1 = directly connected to stratum 0 (most accurate)",
          "Each hop adds 1 to stratum — stratum 16 = unsynchronized/invalid",
          "Accurate time is critical for: logs, certificates, security, OSPF",
        ],
        code: `R1(config)# ntp server 216.239.35.0 prefer
R1(config)# ntp master 3          ! Use own clock as stratum 3 (when no external NTP)
R1(config)# clock timezone SGT 8  ! UTC+8

R1# show ntp status
R1# show ntp associations`
      },
      {
        title: "SNMP — Simple Network Management Protocol",
        bullets: [
          "NMS (Network Management Station): the monitoring application",
          "Agent: software on managed device that responds to queries",
          "MIB: Management Information Base — database of variables",
          "SNMP v1/v2c: community strings (plaintext) — insecure",
          "SNMP v3: MD5/SHA authentication + AES encryption — always use v3",
        ],
        table: {
          headers: ["Operation", "Direction", "Description"],
          rows: [
            ["Get", "Manager → Agent", "Read a value from agent"],
            ["Set", "Manager → Agent", "Change a value on agent"],
            ["Trap", "Agent → Manager", "Unsolicited alert — no acknowledgment"],
            ["Inform", "Agent → Manager", "Acknowledged alert — agent retransmits until ACK"],
          ]
        }
      },
      {
        title: "Syslog Severity Levels",
        table: {
          headers: ["Level", "Name", "Example"],
          rows: [
            ["0", "Emergency", "System is unusable — crash"],
            ["1", "Alert", "Temperature exceeded threshold"],
            ["2", "Critical", "Hardware failure"],
            ["3", "Error", "Interface error"],
            ["4", "Warning", "Configuration change"],
            ["5", "Notice", "Interface up/down"],
            ["6", "Informational", "OSPF neighbor formed"],
            ["7", "Debug", "Detailed protocol output"],
          ]
        },
        bullets: [
          "Mnemonic: Every Awesome Cisco Engineer Will Need Interesting Debug",
          "Syslog UDP 514",
          "Lower number = higher severity (0 is most critical)",
          "Logging trap N = send messages at level N and BELOW (higher severity)",
        ]
      },
      {
        title: "QoS Key Facts",
        bullets: [
          "DSCP EF (Expedited Forwarding) = value 46 → used for VoIP — memorize this",
          "DSCP 0 = Best Effort (default, no QoS marking)",
          "CoS 5 = Voice traffic (Layer 2, 802.1Q PCP field, 0–7)",
          "LLQ (Low Latency Queuing) = CBWFQ + strict priority queue → best for voice",
          "Policing: drops excess → can cause TCP retransmissions, good for ISP limiting",
          "Shaping: buffers/delays excess → smoother but adds latency, good for WAN edge",
        ]
      },
      {
        title: "FTP vs TFTP",
        table: {
          headers: ["Feature", "FTP", "TFTP"],
          rows: [
            ["Ports", "20 (data), 21 (control)", "69"],
            ["Transport", "TCP", "UDP"],
            ["Authentication", "Yes (username/password)", "No — no auth"],
            ["Directory navigation", "Yes", "No"],
            ["Use case", "Interactive file transfers", "IOS/config backup, PXE boot"],
          ]
        },
        code: `! Backup config via TFTP
R1# copy running-config tftp

! Download IOS via TFTP
R1# copy tftp flash

! IOS upgrade process
R1# show flash
R1# copy tftp flash
R1(config)# boot system flash:new-ios-filename
R1# copy run start
R1# reload
R1# show version`
      }
    ]
  },

  {
    id: "ipv6",
    title: "IPv6",
    color: "#00c896",
    sections: [
      {
        title: "IPv6 Basics",
        bullets: [
          "128 bits — written as 8 groups of 4 hex digits separated by colons",
          "Full: 2001:0DB8:ABCD:0012:0000:0000:0000:0001",
          "Rule 1: drop leading zeros in each group → 2001:DB8:ABCD:12:0:0:0:1",
          "Rule 2: replace one consecutive all-zero group with :: → 2001:DB8:ABCD:12::1",
          ":: can only be used ONCE per address",
          "IPv6 does NOT use ARP — replaced by NDP (Neighbor Discovery Protocol)",
          "No broadcast — uses multicast instead",
        ]
      },
      {
        title: "IPv6 Address Types",
        table: {
          headers: ["Type", "Prefix", "Description"],
          rows: [
            ["Global Unicast (GUA)", "2000::/3", "Public, globally routable (like public IPv4)"],
            ["Link-Local", "FE80::/10", "Local link only — auto-configured, mandatory on every interface"],
            ["Unique Local", "FC00::/7", "Private (like RFC 1918)"],
            ["Multicast", "FF00::/8", "One-to-many"],
            ["Loopback", "::1/128", "Self (like 127.0.0.1 in IPv4)"],
          ]
        },
        bullets: [
          "All IPv6 interfaces MUST have a link-local address (FE80::/10)",
          "Link-local addresses are NOT routable beyond the local link",
        ]
      },
      {
        title: "EUI-64 Interface ID Generation",
        bullets: [
          "Used to auto-generate the 64-bit interface ID from the 48-bit MAC address",
          "Step 1: Split MAC in half → insert FF:FE in the middle",
          "Step 2: Flip bit 7 (the universal/local bit) of the first byte",
          "Example: MAC AA:BB:CC:DD:EE:FF → A8:BB:CC:FF:FE:DD:EE:FF",
          "Note: MAC AA = 10101010b → flip bit 7 → 10101000b = A8",
        ]
      },
      {
        title: "NDP — Neighbor Discovery Protocol",
        bullets: ["NDP replaces both ARP and some router discovery from IPv4"],
        table: {
          headers: ["Message", "Purpose", "IPv4 Equivalent"],
          rows: [
            ["Router Solicitation (RS)", "Host asks: any routers on this link?", "—"],
            ["Router Advertisement (RA)", "Router announces: prefix, gateway, config info", "—"],
            ["Neighbor Solicitation (NS)", "Who has this IPv6 address?", "ARP Request"],
            ["Neighbor Advertisement (NA)", "I have that IPv6 address!", "ARP Reply"],
          ]
        },
        bullets: [
          "SLAAC: device auto-configures IPv6 using RA prefix + EUI-64 — no DHCP needed",
          "Solicited-node multicast address: FF02::1:FF + last 24 bits of IPv6 address",
        ]
      },
      {
        title: "IPv6 Configuration",
        code: `! Enable IPv6 routing
R1(config)# ipv6 unicast-routing

! Manual GUA
R1(config-if)# ipv6 address 2001:DB8:1:1::1/64
R1(config-if)# no shutdown

! EUI-64 (auto interface ID from MAC)
R1(config-if)# ipv6 address 2001:DB8:1:1::/64 eui-64

! Link-local only (auto from EUI-64)
R1(config-if)# ipv6 enable

! IPv6 static route (use link-local as next-hop with exit interface!)
R1(config)# ipv6 route 2001:DB8:2::/64 GigabitEthernet0/1 FE80::2

! Default route
R1(config)# ipv6 route ::/0 2001:DB8:12::1

R1# show ipv6 interface brief
R1# show ipv6 neighbors
R1# show ipv6 route`
      },
      {
        title: "IPv6 Multicast Addresses",
        table: {
          headers: ["Address", "Used By"],
          rows: [
            ["FF02::1", "All IPv6 nodes on the link"],
            ["FF02::2", "All IPv6 routers on the link"],
            ["FF02::5", "All OSPFv3 routers"],
            ["FF02::6", "OSPFv3 DR/BDR"],
            ["FF02::9", "All RIPng routers"],
          ]
        }
      }
    ]
  },

  {
    id: "wireless",
    title: "Wireless",
    color: "#7c6df0",
    sections: [
      {
        title: "802.11 Standards",
        table: {
          headers: ["Standard", "Wi-Fi Name", "Bands", "Max Speed", "Key Feature"],
          rows: [
            ["802.11b", "—", "2.4 GHz", "11 Mbps", "Legacy"],
            ["802.11a", "—", "5 GHz", "54 Mbps", "Legacy, 5 GHz only"],
            ["802.11g", "—", "2.4 GHz", "54 Mbps", "Backward compat with b"],
            ["802.11n", "Wi-Fi 4", "2.4 + 5 GHz", "600 Mbps", "MIMO, dual-band"],
            ["802.11ac", "Wi-Fi 5", "5 GHz only", "3.5 Gbps", "MU-MIMO, beamforming"],
            ["802.11ax", "Wi-Fi 6", "2.4 + 5 + 6 GHz", "9.6 Gbps", "OFDMA, BSS Coloring"],
          ]
        },
        bullets: [
          "2.4 GHz non-overlapping channels: 1, 6, and 11 only (critical exam fact!)",
          "5 GHz: 23+ non-overlapping channels — much less congestion",
          "2.4 GHz: longer range, lower speed, more interference",
          "5 GHz: shorter range, higher speed, cleaner spectrum",
        ]
      },
      {
        title: "Wireless Security Standards",
        table: {
          headers: ["Standard", "Encryption", "Status", "Key Exchange"],
          rows: [
            ["WEP", "RC4 (broken)", "NEVER USE — easily cracked", "Static key"],
            ["WPA", "TKIP (RC4-based)", "Legacy — avoid", "Pre-shared key"],
            ["WPA2", "CCMP / AES-128", "Current standard", "PSK or 802.1X"],
            ["WPA3", "CCMP / AES-256 + SAE", "Latest — best security", "SAE (DRAGONFLY)"],
          ]
        },
        bullets: [
          "WPA2-Personal: PSK — everyone shares the same passphrase",
          "WPA2-Enterprise: 802.1X with RADIUS server — per-user credentials",
          "SAE (Simultaneous Authentication of Equals) = WPA3's key exchange — protects against offline dictionary attacks",
          "WPA3 also provides Forward Secrecy — past sessions can't be decrypted if key is compromised",
        ]
      },
      {
        title: "WLC Architecture (Lightweight APs)",
        bullets: [
          "Autonomous APs: self-managed, full config on each AP — simple/small deployments",
          "Lightweight APs (LAPs): handle only RF — controlled by a WLC",
          "WLC (Wireless LAN Controller): centralized config, auth, roaming, security",
          "CAPWAP: tunnel protocol between LAP and WLC",
          "  UDP 5246 = CAPWAP control plane (encrypted)",
          "  UDP 5247 = CAPWAP data plane",
          "FlexConnect: LAP can locally switch data when WLC is unreachable",
        ]
      },
      {
        title: "802.1X Port-Based Authentication",
        bullets: [
          "Supplicant: client device requesting access",
          "Authenticator: switch or AP — passes EAP messages to RADIUS server",
          "Authentication Server: RADIUS — makes the allow/deny decision",
          "EAP-TLS: both client AND server need certificates (most secure)",
          "PEAP: only server needs certificate — client uses username/password inside encrypted tunnel",
        ]
      }
    ]
  },

  {
    id: "automation",
    title: "Automation",
    color: "#f59e0b",
    sections: [
      {
        title: "Configuration Management Tools",
        table: {
          headers: ["Tool", "Model", "Language", "Agent?", "Best for Network?"],
          rows: [
            ["Ansible", "Push", "YAML (playbooks)", "No — agentless (SSH/API)", "Yes ✓"],
            ["Puppet", "Pull", "Puppet DSL", "Yes — Puppet Master", "Limited"],
            ["Chef", "Pull", "Ruby (imperative)", "Yes — Chef Server", "Limited"],
          ]
        },
        bullets: [
          "Idempotent: running same playbook multiple times produces same result (no unintended changes)",
          "Ansible: agentless → uses SSH to push changes to network devices → best for networking",
          "Puppet/Chef: require agents installed on each managed node — harder for network gear",
        ]
      },
      {
        title: "REST API HTTP Methods (CRUD)",
        table: {
          headers: ["Method", "CRUD", "Description", "Safe?"],
          rows: [
            ["GET", "Read", "Retrieve a resource — no side effects", "Yes"],
            ["POST", "Create", "Create a new resource", "No"],
            ["PUT", "Update", "Replace entire resource", "No"],
            ["PATCH", "Update", "Modify part of a resource", "No"],
            ["DELETE", "Delete", "Remove a resource", "No"],
          ]
        }
      },
      {
        title: "HTTP Status Codes",
        table: {
          headers: ["Code", "Meaning"],
          rows: [
            ["200", "OK — success"],
            ["201", "Created — new resource created"],
            ["204", "No Content — success, no response body"],
            ["400", "Bad Request — malformed syntax"],
            ["401", "Unauthorized — authentication required"],
            ["403", "Forbidden — authenticated but not authorized"],
            ["404", "Not Found — resource doesn't exist"],
            ["500", "Internal Server Error — server-side failure"],
          ]
        }
      },
      {
        title: "Network Management Protocols",
        table: {
          headers: ["Protocol", "Transport", "Format", "Use Case"],
          rows: [
            ["SNMP", "UDP 161/162", "BER-encoded", "Read/write device stats, polling, traps"],
            ["NETCONF", "SSH (TCP 830)", "XML", "Full device configuration management"],
            ["RESTCONF", "HTTPS (TCP 443)", "JSON or XML", "REST-style config via HTTP methods"],
          ]
        }
      },
      {
        title: "SDN Architecture",
        bullets: [
          "Traditional networking: distributed control plane — each device runs routing/STP independently",
          "SDN: centralized control plane (controller) — devices just forward per instructions",
          "Northbound Interface (NBI): Controller ↔ Applications — typically REST API",
          "Southbound Interface (SBI): Controller ↔ Network devices — OpenFlow, NETCONF, RESTCONF",
          "Cisco DNA Center: enterprise campus SDN — intent-based networking",
          "Cisco ACI: data center SDN — policy-based with EPGs and contracts",
          "VXLAN: L2 over UDP overlay — 24-bit VNI supports 16M segments (vs VLAN's 4094)",
        ]
      },
      {
        title: "Data Formats Comparison",
        table: {
          headers: ["Feature", "JSON", "XML", "YAML"],
          rows: [
            ["Used by", "REST APIs, RESTCONF", "NETCONF", "Ansible playbooks"],
            ["Readability", "Good", "Verbose", "Best (human-friendly)"],
            ["Comments", "No", "Yes (<!-- -->)", "Yes (# sign)"],
            ["Data types", "string, number, bool, array, object, null", "All strings by default", "string, int, bool, list, dict"],
          ]
        }
      }
    ]
  },

  {
    id: "ipv4",
    title: "IPv4 & Headers",
    color: "#00c896",
    sections: [
      {
        title: "IPv4 Address Classes",
        table: {
          headers: ["Class", "First Octet Range", "Default Mask", "Usable Hosts"],
          rows: [
            ["A", "1–126", "/8 (255.0.0.0)", "16,777,214"],
            ["B", "128–191", "/16 (255.255.0.0)", "65,534"],
            ["C", "192–223", "/24 (255.255.255.0)", "254"],
            ["D", "224–239", "N/A", "Multicast — not assigned to hosts"],
            ["E", "240–255", "N/A", "Reserved / Experimental"],
          ]
        },
        bullets: [
          "Note: 127.x.x.x is reserved for loopback — NOT in class A usable range",
          "Classes are mostly legacy — CIDR (classless) is used in modern networking",
        ]
      },
      {
        title: "Special IPv4 Addresses",
        table: {
          headers: ["Range / Address", "Purpose"],
          rows: [
            ["10.0.0.0/8", "Private (Class A)"],
            ["172.16.0.0–172.31.255.255 (/12)", "Private (Class B)"],
            ["192.168.0.0/16", "Private (Class C)"],
            ["127.0.0.0/8", "Loopback — 127.0.0.1 points to self"],
            ["169.254.0.0/16", "APIPA — self-assigned when DHCP fails"],
            ["0.0.0.0/0", "Default route / any network"],
            ["255.255.255.255", "Limited broadcast — stays on local subnet"],
          ]
        }
      },
      {
        title: "IPv4 Header Key Fields",
        table: {
          headers: ["Field", "Size", "Purpose"],
          rows: [
            ["Version", "4 bits", "IPv4 = 4, IPv6 = 6"],
            ["IHL", "4 bits", "Header length in 32-bit words (min 5 = 20 bytes)"],
            ["DSCP", "6 bits", "QoS marking (EF=46 for VoIP)"],
            ["Total Length", "16 bits", "Total packet size (max 65,535 bytes)"],
            ["TTL", "8 bits", "Decremented by 1 at each hop — dropped at 0"],
            ["Protocol", "8 bits", "Upper layer: TCP=6, UDP=17, ICMP=1, OSPF=89"],
            ["Header Checksum", "16 bits", "Recalculated at every router hop"],
            ["Source IP", "32 bits", "Origin address"],
            ["Destination IP", "32 bits", "Destination address"],
          ]
        },
        bullets: [
          "TTL defaults: Windows=128, Linux/macOS=64, Cisco IOS=255",
          "Traceroute sends packets with TTL=1,2,3... to discover each hop",
          "DF bit (Don't Fragment) = 1: drop if > MTU, send ICMP Fragmentation Needed",
          "Fragmentation is reassembled at the DESTINATION HOST only (not intermediate routers)",
        ]
      }
    ]
  },

  {
    id: "design",
    title: "Design & WAN",
    color: "#f43f5e",
    sections: [
      {
        title: "Three-Tier Campus Architecture",
        table: {
          headers: ["Layer", "Role", "Key Rule"],
          rows: [
            ["Core", "High-speed backbone — fast forwarding", "NEVER apply ACLs or policy here"],
            ["Distribution", "Inter-VLAN routing, ACLs, summarization, redundancy", "Where policy is applied"],
            ["Access", "End-device connectivity, port security, VLANs, PoE", "Where users connect"],
          ]
        },
        bullets: [
          "Two-tier (Collapsed Core): Distribution + Core combined — for small/medium campuses",
          "Spine-Leaf (Data Center): every Leaf connects to every Spine — 2 hops max between any two endpoints",
          "Spine-Leaf is optimized for east-west (server-to-server) traffic",
        ]
      },
      {
        title: "WAN Technologies",
        table: {
          headers: ["Type", "Description", "Notes"],
          rows: [
            ["Leased Line", "Dedicated point-to-point circuit", "Reliable, expensive, fixed BW"],
            ["MPLS", "Provider-managed private WAN with labels", "Full-mesh possible, SLA backed, not cheap"],
            ["Internet VPN", "IPsec tunnel over public internet", "Cheaper, less reliable, site-to-site or remote"],
            ["SD-WAN", "Intelligent multi-WAN — MPLS + internet + LTE", "Best cost/performance balance"],
          ]
        }
      },
      {
        title: "VPN Types",
        bullets: [
          "Site-to-site VPN: connects fixed locations using IPsec — transparent to users",
          "Remote access VPN: individual users connect via VPN client (SSL/TLS or IPsec)",
          "GRE tunnel: encapsulates any L3 protocol — not encrypted by default (pair with IPsec)",
        ]
      },
      {
        title: "Cloud Service Models",
        table: {
          headers: ["Model", "Provider Manages", "Customer Manages"],
          rows: [
            ["IaaS (Infrastructure as a Service)", "Hardware, virtualization", "OS, middleware, apps, data"],
            ["PaaS (Platform as a Service)", "Hardware + OS + runtime + middleware", "Apps and data"],
            ["SaaS (Software as a Service)", "Everything", "Just use the application"],
          ]
        },
        bullets: [
          "Public cloud: AWS, Azure, GCP — shared infrastructure, provider-owned",
          "Private cloud: dedicated to one organization — more control, higher cost",
          "Hybrid cloud: mix of public and private",
        ]
      },
      {
        title: "Hypervisor Types",
        table: {
          headers: ["Type", "Also Called", "Examples", "Description"],
          rows: [
            ["Type 1", "Bare-metal", "VMware ESXi, Hyper-V", "Runs directly on hardware — production use"],
            ["Type 2", "Hosted", "VirtualBox, VMware Workstation", "Runs on top of an OS — lab/desktop use"],
          ]
        }
      }
    ]
  }
];
