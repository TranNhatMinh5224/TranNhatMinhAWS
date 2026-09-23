---
title: "Worklog Week 3"
date: 2026-08-17
weight: 3
chapter: false
pre: " <b> 1.3. </b> "
---

# Worklog Week 3: AWS VPC Network Engineering, Multi-AZ Subnetting & Internet Gateway Routing

### 1. General Information & Core Technical Objectives
* **Timeline:** From 17/08/2026 to 23/08/2026 (Week 3).
* **Alignment with [TTTN-02.docx] Syllabus:** Week 3 Objective — *AWS Networking Deep-Dive: VPC, Subnet, Internet Gateway*.
* **Internship Mentor (CBHD):** Pham Van Phong (Solutions Architect).
* **Host Supervisor:** Nguyen Gia Hung (Senior Solutions Architect - AWS Vietnam).
* **Core Technical Objectives:**
  1. Master cloud network topology under **Amazon Virtual Private Cloud (VPC)**, planning an RFC 1918 IPv4 address space using a `/16` CIDR block (`10.0.0.0/16`, offering 65,536 private IP addresses).
  2. Architect a resilient **Multi-AZ Subnetting layout** distributed across 2 Availability Zones (`ap-southeast-1a` and `ap-southeast-1b`) divided into 3 segregated network tiers:
     - **Public Subnet Tier:** `10.0.1.0/24` and `10.0.2.0/24` (Internet Gateway attached for Application Load Balancers).
     - **Private App Subnet Tier:** `10.0.10.0/24` and `10.0.20.0/24` (reserved for EC2 Compute nodes and Celery Ingestion Workers).
     - **Isolated Database Subnet Tier:** `10.0.100.0/24` and `10.0.200.0/24` (housing Amazon RDS PostgreSQL and Qdrant Vector Store with zero route to the public Internet).
  3. Provision an **Internet Gateway (IGW)** and establish segregated **Route Tables**: Public Route Table (`0.0.0.0/0` ➔ `igw-xxxx`) and Private Route Tables (`10.0.0.0/16 local`).
  4. Compare and implement stateful **Security Groups** (ENI level) and stateless **Network ACLs** (Subnet level) implementing Zero-Trust network boundaries.

---

### 2. Work Breakdown Structure & Daily Technical Execution Log

| Day | Technical Tasks & Architecture Objectives | Start Date | End Date | References & Documentation | Deliverables & Verified Evidence |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Mon** | • Studied CIDR block math and subnet masking (/16, /24, /28).<br>• Accounted for the 5 reserved IP addresses per subnet (`.0` Network, `.1` VPC Router, `.2` DNS, `.3` Future, `.255` Broadcast).<br>• Formulated a static IP allocation matrix for all RAG microservices. | 17/08/2026 | 17/08/2026 | • [Amazon VPC IP Addressing & Subnets](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Subnets.html)<br>• [VPC Architecture Design Best Practices](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/welcome.html) | Finalized Network CIDR Matrix across 6 Subnets spanning 2 Availability Zones. |
| **Tue** | • Launched custom VPC `Custom-RAG-VPC` (`10.0.0.0/16`) via AWS CLI.<br>• Enabled `enableDnsHostnames` and `enableDnsSupport` VPC attributes.<br>• Provisioned 2 Public Subnets and 4 Private/Isolated Subnets across `ap-southeast-1a` and `ap-southeast-1b`. | 18/08/2026 | 18/08/2026 | • [Creating a VPC using AWS CLI](https://docs.aws.amazon.com/vpc/latest/userguide/create-vpc-cli.html)<br>• [AWS Multi-AZ Subnet Planning Guide](https://docs.aws.amazon.com/whitepapers/latest/real-time-communication-on-aws/high-availability-and-multi-az.html) | 6 subnets created and verified with Well-Architected standard tags. |
| **Wed** | • Provisioned Internet Gateway `Custom-RAG-IGW` and attached it to `Custom-RAG-VPC`.<br>• Created Public Route Table `Public-RTB` and configured default route `0.0.0.0/0` targeting the IGW.<br>• Bound both Public Subnets to `Public-RTB`. | 19/08/2026 | 19/08/2026 | • [Internet Gateways in Amazon VPC](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html)<br>• [Configuring Route Tables](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html) | Verified bidirectional Internet transit capability for public ingress components. |
| **Thu** | • Deployed test EC2 instances inside Public Subnet and Private Subnet.<br>• Validated internal routing by testing cross-subnet packet transmission via private IPs (`10.0.x.x`).<br>• Verified that Private Subnet instances cannot be resolved or probed directly from external WAN. | 20/08/2026 | 20/08/2026 | • [Amazon VPC Peering & Routing Scenarios](https://docs.aws.amazon.com/vpc/latest/peering/peering-configurations-full-access.html)<br>• [Amazon VPC Network Troubleshooting](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Troubleshooting.html) | Cross-AZ internal VPC throughput verified with ultra-low latency (<1ms). |
| **Fri** | • Configured **Security Group Chaining** (Zero-Trust Firewall Matrix):<br>  1. `ALB-SG`: Inbound ports 80/443 open to `0.0.0.0/0`.<br>  2. `EC2-App-SG`: Inbound ports 8000 (Backend) and 3000 (Frontend) restricted exclusively to `ALB-SG`.<br>  3. `Database-SG`: Inbound ports 5432 (PostgreSQL) and 6333 (Qdrant) restricted exclusively to `EC2-App-SG`. | 21/08/2026 | 21/08/2026 | • [Security Group Rules Reference](https://docs.aws.amazon.com/vpc/latest/userguide/security-group-rules-reference.html)<br>• [Zero Trust Architecture on AWS](https://aws.amazon.com/security/zero-trust/) | Enforced strict Zero-Trust boundaries: Database and compute tiers completely shielded from WAN. |
| **Sat - Sun** | • Conducted routing and throughput audits using `traceroute` and `nc` (Netcat).<br>• Generated VPC architecture topology diagram and finalized Week 3 technical report. | 22/08/2026 | 23/08/2026 | • [Network ACLs Overview](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html)<br>• [Cloud Journey Networking Module](https://cloudjourney.awsstudygroup.com/) | Delivered complete enterprise VPC foundation per TTTN-02 milestones. |

---

### 3. Hands-on CLI & Configuration Code Snippets

#### 3.1. Provisioning Custom VPC and DNS Resolution:
```bash
# 1. Create VPC with /16 CIDR block
VPC_ID=$(aws ec2 create-vpc \
    --cidr-block 10.0.0.0/16 \
    --region ap-southeast-1 \
    --query 'Vpc.VpcId' \
    --output text)
aws ec2 create-tags --resources $VPC_ID --tags Key=Name,Value=Custom-RAG-VPC

# 2. Enable DNS hostnames and resolution
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames "{\"Value\":true}"
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-support "{\"Value\":true}"
```

#### 3.2. Subnet Allocation Across Availability Zones:
```bash
# Create Public Subnet 1 in ap-southeast-1a
PUB_SUB1=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.1.0/24 \
    --availability-zone ap-southeast-1a \
    --query 'Subnet.SubnetId' --output text)
aws ec2 create-tags --resources $PUB_SUB1 --tags Key=Name,Value=Public-Subnet-1a
aws ec2 modify-subnet-attribute --subnet-id $PUB_SUB1 --map-public-ip-on-launch

# Create Isolated Database Subnet 1 in ap-southeast-1a
ISO_SUB1=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.100.0/24 \
    --availability-zone ap-southeast-1a \
    --query 'Subnet.SubnetId' --output text)
aws ec2 create-tags --resources $ISO_SUB1 --tags Key=Name,Value=Isolated-DB-Subnet-1a
```

#### 3.3. Internet Gateway & Route Table Binding:
```bash
# 1. Create Internet Gateway and attach to VPC
IGW_ID=$(aws ec2 create-internet-gateway --query 'InternetGateway.InternetGatewayId' --output text)
aws ec2 create-tags --resources $IGW_ID --tags Key=Name,Value=Custom-RAG-IGW
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID

# 2. Create Public Route Table and add default Internet route
RTB_PUB=$(aws ec2 create-route-table --vpc-id $VPC_ID --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-tags --resources $RTB_PUB --tags Key=Name,Value=Public-RouteTable
aws ec2 create-route --route-table-id $RTB_PUB --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID

# 3. Associate Public Subnet
aws ec2 associate-route-table --subnet-id $PUB_SUB1 --route-table-id $RTB_PUB
```

#### 3.4. Security Group Chaining (Zero-Trust Matrix):
```bash
# Security Group for Database Tier
DB_SG=$(aws ec2 create-security-group \
    --group-name "RDS-PostgreSQL-SG" \
    --description "Security group for RDS instance isolated" \
    --vpc-id $VPC_ID \
    --query 'GroupId' --output text)

# Restrict port 5432 ingress exclusively to EC2 App Security Group (zero IP exposure)
aws ec2 authorize-security-group-ingress \
    --group-id $DB_SG \
    --protocol tcp \
    --port 5432 \
    --source-group $EC2_APP_SG
```

---

### 4. Technical Challenges & Troubleshooting (Root Cause Analysis)

* **Issue 1: EC2 instance in Public Subnet launched without a Public IPv4.**
  * *Symptom:* Newly provisioned instance in `Public-Subnet-1a` showed only a private IP (`10.0.1.x`), rendering it unreachable via SSH over the Internet.
  * *Root Cause Analysis:* Unlike default VPC subnets, subnets created inside custom VPCs have the `MapPublicIpOnLaunch` attribute disabled (`false`) by default.
  * *Resolution:* Enabled automatic public IP assignment across all public subnets via AWS CLI:
    ```bash
    aws ec2 modify-subnet-attribute --subnet-id $PUB_SUB1 --map-public-ip-on-launch
    ```
    Subsequent instances received public IPv4 addresses upon instantiation.

* **Issue 2: EC2 App Server unable to connect to Database in Isolated Subnet.**
  * *Symptom:* Connection verification via `nc -zv 10.0.100.25 5432` timed out.
  * *Root Cause Analysis:* The Database Security Group ingress rule was initially configured using a static private IP (`10.0.10.15/32`). An instance restart triggered a dynamic private IP reassignment, invalidating the firewall rule.
  * *Resolution:* Implemented **Security Group Chaining** by configuring the ingress `Source` parameter to reference the `EC2-App-SG` ID instead of a CIDR IP. This dynamic security group reference guarantees continuous, secure access independent of underlying IP changes.

---

### 5. Verified Deliverables & Architecture Takeaways
1. **Multi-AZ Custom VPC Architecture:** Complete `10.0.0.0/16` topology with 6 subnets across 2 Availability Zones delivering high availability.
2. **Zero-Trust Network Isolation:** Segmented Public (ALB), Private (Compute), and Isolated (Data) tiers protecting sensitive databases from direct WAN access.
3. **Dynamic Security Group Chaining:** Elastic firewall policy established as the core foundation for the Capstone RAG deployment.
