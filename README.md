Yes! **Bolna and LiveKit Agents do very similar jobs, but they are not exactly the same.**

Both can be used to build AI voice agents that listen, understand, respond, handle conversations and perform actions.

The biggest difference is how much infrastructure and code you manage yourself.

## **1. What exactly does Bolna do?**

Think of Bolna as a **voice-agent orchestration platform**.

Suppose you want to build an AI receptionist.

Without Bolna, you need to integrate several components yourself:

- Telephony to make and receive calls.
- STT to convert speech into text.
- LLM to understand the customer.
- TTS to generate spoken responses.
- Conversation management.
- Tool calling to execute business operations.

Bolna brings these components together and lets you configure an agent.

## **How Bolna works**

**Customer phone**

Twilio / Plivo and supported telephony

Bolna orchestration

**Voice conversation engine**

Coordinates audio, conversation and responses

**STT**

Deepgram

**LLM**

OpenAI

**TTS**

ElevenLabs

**Business tools**

APIs · Database · Booking · CRM · Notifications

Bolna's open-source repository describes this orchestration architecture and its integrations.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub



## **2. Bolna vs LiveKit**

[Bolna: Build Your Perfect Voice AI Agent | Product Hunt](https://images.openai.com/static-rsc-4/brd513NcaRFUT7hcGlbab6PbsG8r87r9bphPZ3Mx_Shrdk-wW-5uY-e9tozV8haYzXHj7BB5oTqvQ_xzEFvlwaqns28J_H3XQ44oSrTU4SXnh14IzNiYGHab4y5p5XxqssiDrS5sMmJuZmBvE1rWsnsrmPc8LxSESTD9iIXrofU?purpose=inline)

**Bolna**

More platform-oriented

[LiveKit: How I Got Here](https://images.openai.com/static-rsc-4/eB94pKBIpMGJ5VE4Spn_KIzfisl3u-tcWJUgQULUe1meArvLwlfno4LpOLTZ9UY8g7B5Z2OGgnknAivEINd2ho_xM0hNx4NMTdVY-LpDEfSzQLKPoW2aaizZcNy3ZgSc_Y2y7uugmlaVZNnVaQxFzjGNjzmJs6M5q-cqkIwEv04?purpose=inline)

**LiveKit**

More developer-oriented

| Capability              | Bolna                  | LiveKit Agents             |
| ----------------------- | ---------------------- | -------------------------- |
| Voice agents            | Yes                    | Yes                        |
| STT integration         | Yes                    | Yes                        |
| LLM integration         | Yes                    | Yes                        |
| TTS integration         | Yes                    | Yes                        |
| Phone calls             | Telephony integrations | SIP/telephony integrations |
| Custom business logic   | Yes                    | Yes                        |
| Low-level media control | More abstracted        | More control               |
| Agent configuration     | APIs/dashboard         | Primarily code             |
| Open source             | Yes                    | Yes                        |
| MCP                     | Bolna MCP available    | MCP integrations supported |

LiveKit provides a real-time media infrastructure based on WebRTC, alongside its agent framework.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://docs.livekit.io\&sz=32)

LiveKit Documentation+2



## **3. What happens when a customer interrupts?**

Imagine this conversation:

**AI:** Hello, your delivery is scheduled for tomorrow morning.

**Customer:** Wait! I want it tomorrow evening.

**AI:** Sure, tomorrow evening. Would 6 PM work?

Both platforms can support interruption-aware conversations, depending on their configured models and settings.

But LiveKit gives you more direct control over the conversation runtime, turn-taking and interruption logic.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://livekit.com\&sz=32)

LiveKit+1



## **4. What should you use for ReDeliver AI?**

My recommendation:

**Bolna**

Start here

Use Bolna for:

- Quickly creating voice agents.
- Making outbound delivery calls.
- Configuring multilingual conversations.
- Testing agent prompts.
- Connecting business actions.

  **LiveKit**

Consider LiveKit when you need:

- Custom real-time voice experiences.
- More control over audio streaming.
- Custom interruption and turn-taking logic.
- Web/mobile voice applications.
- More complex agent workflows.

## **5. One important architecture distinction**

You can build your own platform on top of either technology.

For example:

```
              YOUR PRODUCT
             ReDeliver AI
                   |
          Backend (Spring Boot)
                   |
          Agent Management API
                   |
          +--------+--------+
          |                 |
        Bolna             LiveKit
          |                 |
     Phone calls       Voice sessions
          |                 |
          +--------+--------+
                   |
            PostgreSQL
                   |
          Delivery Management
```

You don't need both initially. Choose one runtime and build your business logic around it.

## **6. My question for your next learning step**

**What do you ultimately want to build?**

A platform like Bolna — users create voice agents without coding.

A custom voice-agent platform using LiveKit and Python/Node.js.

A platform supporting both Bolna and LiveKit as interchangeable voice engines.

Continue learning

This decision will determine the architecture we should build, rather than just creating another basic voice chatbot.