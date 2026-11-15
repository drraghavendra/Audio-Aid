ReDeliver AI
ReDeliver AI is an intelligent, voice-driven delivery management platform designed to automate outbound customer calls, handle real-time delivery rescheduling, and execute backend logistics operations seamlessly.
---
📋 Table of Contents
Overview
System Architecture
Voice Engine Comparison: Bolna vs. LiveKit Agents
How It Works
Interruption & Turn-Taking Handling
Tech Stack
Roadmap & Architectural Direction
---
🚀 Overview
Managing failed or rescheduled deliveries requires timely, natural communication with customers. ReDeliver AI bridges the gap between backend logistics systems and customers using conversational voice AI agents that can:
Initiate outbound delivery confirmation and rescheduling calls.
Understand natural, multilingual customer responses.
Handle mid-sentence customer interruptions gracefully.
Trigger real-time database updates, CRM entries, and delivery slot bookings via tool calling.
---
🏗 System Architecture
ReDeliver AI is designed around a modular backend architecture where the core business logic is decoupled from the underlying voice runtime. This allows the platform to start fast with a managed orchestration layer (Bolna) and optionally scale or swap into low-level real-time media control (LiveKit Agents).
```text
               YOUR PRODUCT
               ReDeliver AI
                    |
           Backend (Spring Boot)
                    |
           Agent Management API
                    |
           +--------+--------+
           |                 |
         Bolna            LiveKit
           |                 |
      Phone calls      Voice sessions
           |                 |
           +--------+--------+
                    |
               PostgreSQL
                    |
          Delivery Management
```
---
⚖️ Voice Engine Comparison: Bolna vs. LiveKit Agents
Both Bolna and LiveKit Agents enable AI voice agents that listen, understand, respond, and execute actions. The primary distinction lies in infrastructure abstraction versus low-level media control:
Capability	Bolna (Platform-Oriented)	LiveKit Agents (Developer-Oriented)
Core Focus	End-to-end voice-agent orchestration	Real-time WebRTC media infrastructure & agent framework
Voice Agents	Yes	Yes
STT / LLM / TTS	Built-in integrations (Deepgram, OpenAI, ElevenLabs, etc.)	Modular plugin integrations
Telephony	Native telephony integrations (Twilio, Plivo, etc.)	SIP & telephony integrations
Low-Level Media Control	More abstracted	Granular control over audio streams & turn-taking
Agent Configuration	APIs & Dashboard	Primarily code-driven (Python / Node.js)
Custom Business Logic	Yes (Webhooks & Tool Calling)	Yes (Direct code execution & Tool Calling)
MCP Support	Bolna MCP available	MCP integrations supported
Open Source	Yes	Yes
Why Start with Bolna?
For the initial phase of ReDeliver AI, Bolna is recommended to accelerate time-to-market:
Rapidly spin up outbound delivery voice agents without managing WebRTC/telephony plumbing.
Easily configure multilingual prompts and test conversation flows.
Connect directly to ReDeliver AI's Spring Boot business APIs for live order updates.
When to Introduce LiveKit?
LiveKit Agents becomes ideal as the product expands to require:
Custom in-app web or mobile voice experiences over WebRTC.
Fine-grained control over audio streaming, latency, and custom interruption/turn-taking logic.
Complex, multi-agent real-time workflows.
---
⚙️ How It Works
When using Bolna as the primary voice orchestration engine, a typical delivery call follows this pipeline:
Trigger: ReDeliver AI's Spring Boot backend identifies a delivery requiring customer confirmation and calls the Agent Management API.
Telephony: Bolna initiates an outbound call to the Customer Phone via Twilio / Plivo.
Voice Conversation Engine:
STT (Speech-to-Text): Deepgram transcribes customer speech in real time.
LLM (Reasoning): OpenAI processes the intent, delivery context, and conversation state.
TTS (Text-to-Speech): ElevenLabs synthesizes natural, low-latency voice responses.
Business Tools Execution: During the call, the agent invokes tool calls to interact with PostgreSQL, Delivery Management APIs, Booking systems, and Notifications.
---
🗣 Interruption & Turn-Taking Handling
Real-world phone calls are non-linear. ReDeliver AI supports interruption-aware conversations so customers can naturally redirect the agent mid-sentence:
> **AI:** *"Hello, your delivery is scheduled for tomorrow morning."*  
> **Customer:** *"Wait! I want it tomorrow evening."*  
> **AI:** *"Sure, tomorrow evening. Would 6 PM work?"*
---
🛠 Tech Stack
Core Backend: Java / Spring Boot
Database: PostgreSQL
Voice Orchestration (Primary): Bolna (with Twilio/Plivo, Deepgram, OpenAI, ElevenLabs)
Real-Time Media Runtime (Optional/Future): LiveKit Agents (WebRTC, SIP, Python/Node.js)
---
🧭 Roadmap & Architectural Direction
As ReDeliver AI evolves, development can follow one of three architectural tracks depending on product goals:
[ ] Track A — Rapid SaaS / Logistics Automation (Bolna-First): Focus on Spring Boot delivery workflows, prompt optimization, and multi-language outbound campaigns using Bolna's APIs.
[ ] Track B — Custom Real-Time Voice Platform (LiveKit-First): Build a custom Python/Node.js voice runtime on LiveKit for full control over WebRTC streams, custom turn-taking, and in-app voice widgets.
[ ] Track C — Engine-Agnostic Voice Platform: Abstract the Agent Management API in Spring Boot to support both Bolna (for telephony) and LiveKit (for web/mobile/custom sessions) as interchangeable voice engines.
