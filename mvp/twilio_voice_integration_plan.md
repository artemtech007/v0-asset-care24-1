# 📞 Интеграция IP-телефонии через Twilio (Voice) в AssetCare24

**Сложность:** Средняя (3/5) | **Время реализации:** 2-3 дня
**Стоимость:** ~$0.014/мин входящих + $0.02/мин исходящих

---

## 🎯 Обзор интеграции

Twilio Programmable Voice позволяет:
- ✅ **Принимать звонки** на виртуальный номер
- ✅ **Записывать разговоры** в реальном времени
- ✅ **Подключать голосовых ботов** (Text-to-Speech + Speech-to-Text)
- ✅ **Интегрировать с n8n** через webhooks
- ✅ **Передавать звонки** людям или ботам

### Архитектура:
```
Клиент звонит → Twilio Voice → n8n Webhook → OpenAI (голосовой бот) → Twilio TTS
```

---

## 📋 План реализации (пошагово)

### **Этап 1: Настройка Twilio Voice (1 час)**

#### **1.1 Покупка номера**
```bash
# В Twilio Console:
1. Phone Numbers → Manage → Buy a Number
2. Выбрать страну (Германия: +49)
3. Тип: Voice & SMS capable
4. Купить номер (~$1/месяц)
```

#### **1.2 Настройка Voice Webhook**
```bash
# Voice Configuration:
- A Call Comes In: https://n8n.your-domain.com/webhook/twilio-voice
- Method: POST
- Accept: Application/JSON
```

#### **1.3 Переменные окружения**
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+49123456789
```

---

### **Этап 2: Базовый прием звонков в n8n (2 часа)**

#### **2.1 Создание Voice Webhook Workflow**
```
Webhook (POST /webhook/twilio-voice)
    ↓
Function Node: Parse Twilio Voice Data
    ↓
Twilio Voice Node: Respond with TwiML
```

#### **2.2 Парсинг данных от Twilio**
```javascript
// Function Node: Parse Voice Data
function parseVoiceData(data) {
  return {
    call_sid: data.CallSid,
    from_number: data.From,
    to_number: data.CallStatus,
    call_status: data.CallStatus,
    direction: data.Direction, // inbound/outbound
    timestamp: new Date().toISOString()
  };
}
```

#### **2.3 Простой автоответчик (TwiML)**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice" language="de-DE">
        Hallo! Sie haben AssetCare24 erreicht.
        Für eine neue Anfrage drücken Sie 1.
        Für den Status einer bestehenden Anfrage drücken Sie 2.
    </Say>
    <Gather input="dtmf" timeout="10" numDigits="1" action="/webhook/voice-menu">
        <Say>Bitte wählen Sie eine Option.</Say>
    </Gather>
</Response>
```

---

### **Этап 3: Запись разговоров (1 час)**

#### **3.1 Включение записи в TwiML**
```xml
<Response>
    <Record
        action="/webhook/recording-complete"
        recordingStatusCallback="/webhook/recording-status"
        maxLength="300"
        playBeep="true"
        trim="trim-silence"
    />
    <Say>Bitte beschreiben Sie Ihr Problem nach dem Signalton.</Say>
</Response>
```

#### **3.2 Обработка записей в n8n**
```
Twilio Webhook (Recording Complete)
    ↓
Function: Download Recording
    ↓
HTTP Request: GET recording URL
    ↓
Supabase: Save recording metadata
    ↓
OpenAI: Speech-to-Text transcription
    ↓
Supabase: Save transcription
```

#### **3.3 Сохранение в базу данных**
```sql
-- Таблица для звонков
CREATE TABLE voice_calls (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    call_sid text UNIQUE,
    from_number text,
    to_number text,
    direction text CHECK (direction IN ('inbound', 'outbound')),
    status text,
    duration_seconds integer,
    recording_url text,
    transcription_text text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Таблица для записей
CREATE TABLE voice_recordings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id uuid REFERENCES voice_calls(id),
    recording_sid text,
    duration_seconds integer,
    url text,
    transcription text,
    created_at timestamptz DEFAULT now()
);
```

---

### **Этап 4: Голосовой ИИ-бот (4 часа)**

#### **4.1 Архитектура бота**
```
Входящий звонок → Twilio → n8n → OpenAI Realtime API → Twilio TTS
```

#### **4.2 OpenAI Realtime API Integration**
```javascript
// n8n Function Node: Voice Bot Logic
async function voiceBot(request) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  // Инициализация Realtime сессии
  const session = await openai.realtime.createSession({
    model: 'gpt-4o-realtime-preview',
    voice: 'alloy',
    instructions: `You are a helpful voice assistant for AssetCare24.
    Help customers with home service requests in German.
    Collect: problem description, address, urgency level.`
  });

  return {
    session_id: session.id,
    twiml: `<Connect><Stream url="wss://api.openai.com/v1/realtime?session=${session.id}"/></Connect>`
  };
}
```

#### **4.3 TwiML для бота**
```xml
<Response>
    <Connect>
        <Stream url="wss://n8n.your-domain.com/voice-stream" />
    </Connect>
</Response>
```

#### **4.4 WebSocket обработка в n8n**
```
WebSocket Trigger (Voice Stream)
    ↓
OpenAI Realtime Node
    ↓
Function: Process AI Response
    ↓
WebSocket Response: Send audio back
```

---

## 🎛️ Готовые компоненты для копирования

### **Voice Webhook Template (n8n)**
```json
{
  "name": "Voice Call Handler",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "twilio-voice",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "functionCode": "return { callSid: $json.CallSid, from: $json.From, status: $json.CallStatus }"
      },
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [460, 300]
    }
  ],
  "connections": {
    "Webhook": { "main": [[{ "node": "Function", "type": "main", "index": 0 }]] }
  }
}
```

### **Recording Handler Template**
```json
{
  "name": "Call Recording Processor",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "recording-complete"
      },
      "type": "n8n-nodes-base.webhook"
    },
    {
      "parameters": {
        "url": "={{ $json.RecordingUrl }}",
        "method": "GET",
        "sendHeaders": true,
        "headerParameters": {
          "Authorization": "={{ 'Basic ' + Buffer.from($credentials.twilio.accountSid + ':' + $credentials.twilio.authToken).toString('base64') }}"
        }
      },
      "type": "n8n-nodes-base.httpRequest"
    }
  ]
}
```

---

## 💰 Стоимость и лимиты

### **Ценообразование Twilio Voice (Германия):**
- **Входящие звонки:** €0.012/мин
- **Исходящие звонки:** €0.024/мин
- **Запись:** €0.004/мин + €0.02/мин хранение
- **Номер:** €1/месяц

### **Лимиты:**
- **Длительность звонка:** макс 4 часа
- **Размер записи:** макс 100MB
- **API calls:** 200/min (платно при превышении)

---

## 🔧 Реализация по этапам

### **Этап 1: Базовый прием звонков (1 день)**
1. ✅ Купить номер в Twilio
2. ✅ Настроить webhook URL
3. ✅ Создать простой n8n workflow с автоответчиком
4. ✅ Протестировать входящий звонок

### **Этап 2: Запись разговоров (0.5 дня)**
1. ✅ Добавить `<Record>` в TwiML
2. ✅ Создать workflow для обработки записей
3. ✅ Настроить хранение в Supabase
4. ✅ Добавить Speech-to-Text через OpenAI

### **Этап 3: Голосовой бот (2 дня)**
1. ✅ Изучить OpenAI Realtime API
2. ✅ Создать WebSocket обработчик в n8n
3. ✅ Интегрировать с Twilio Streams
4. ✅ Настроить голосовые инструкции

---

## 🧪 Тестирование

### **Тестовый звонок:**
```bash
# Звонок на тестовый номер
curl -X POST https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Calls.json \
  --data-urlencode "Url=http://demo.twilio.com/docs/voice.xml" \
  --data-urlencode "To=+49123456789" \
  --data-urlencode "From=+49123456789" \
  -u {AccountSid}:{AuthToken}
```

### **Проверка записей:**
```bash
# Получить список записей
curl -X GET "https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Recordings.json" \
  -u {AccountSid}:{AuthToken}
```

---

## 🎧 Интерфейс оператора и управление звонками

### **Веб-интерфейс оператора (Browser-based)**

#### **1. Расширение админки**
Добавить новую вкладку "📞 Телефония" в существующую админку:

```typescript
// site/components/admin-dashboard.tsx - добавить вкладку
const tabs = [
  { id: 'uebersicht', label: 'Übersicht' },
  { id: 'benutzer', label: 'Benutzer' },
  { id: 'auftraege', label: 'Aufträge' },
  { id: 'telephony', label: '📞 Telephony' }, // НОВАЯ ВКЛАДКА
  { id: 'statistiken', label: 'Statistiken' }
];
```

#### **2. Компонент голосовой панели**
```typescript
// site/components/voice-operator-panel.tsx
import { useState, useRef, useEffect } from 'react';

export function VoiceOperatorPanel() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(50);

  const audioContextRef = useRef(null);
  const microphoneRef = useRef(null);
  const remoteAudioRef = useRef(null);

  // Инициализация WebRTC
  useEffect(() => {
    initializeAudio();
  }, []);

  const initializeAudio = async () => {
    try {
      // Запрос доступа к микрофону
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      microphoneRef.current = stream;

      // Создание AudioContext
      audioContextRef.current = new AudioContext();

      // Создание анализатора для визуализации
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsConnected(true);
    } catch (error) {
      console.error('Ошибка доступа к микрофону:', error);
    }
  };

  return (
    <div className="voice-operator-panel">
      {/* Статус подключения */}
      <div className="status-indicator">
        <div className={`status-light ${isConnected ? 'connected' : 'disconnected'}`} />
        <span>{isConnected ? 'Подключено к микрофону' : 'Нет доступа к микрофону'}</span>
      </div>

      {/* Текущий звонок */}
      {currentCall && (
        <div className="active-call">
          <h3>Активный звонок</h3>
          <p>От: {currentCall.from}</p>
          <p>Длительность: {currentCall.duration}</p>
        </div>
      )}

      {/* Панель управления */}
      <div className="controls">
        <button
          className={`control-btn ${isMuted ? 'muted' : ''}`}
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? '🔇' : '🎤'} {isMuted ? 'Включить микрофон' : 'Выключить микрофон'}
        </button>

        <div className="volume-control">
          <label>Громкость: {volume}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
          />
        </div>

        <button className="control-btn hangup" disabled={!currentCall}>
          📞 Положить трубку
        </button>
      </div>

      {/* Визуализация аудио */}
      <div className="audio-visualization">
        <canvas ref={visualizationCanvasRef} width="300" height="100" />
      </div>

      {/* Журнал звонков */}
      <div className="call-log">
        <h4>Последние звонки</h4>
        {/* Список звонков из API */}
      </div>

      {/* Удаленный аудио элемент */}
      <audio ref={remoteAudioRef} autoPlay />
    </div>
  );
}
```

#### **3. API endpoints для управления звонками**
```typescript
// site/app/api/admin/voice/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();

  // Получить активные звонки
  const { data: activeCalls } = await supabase
    .from('voice_calls')
    .select('*')
    .eq('status', 'in-progress')
    .order('created_at', { ascending: false });

  // Получить историю звонков
  const { data: callHistory } = await supabase
    .from('voice_calls')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  return NextResponse.json({
    activeCalls,
    callHistory
  });
}

export async function POST(request: NextRequest) {
  const { action, callSid, phoneNumber } = await request.json();
  const supabase = createClient();

  switch (action) {
    case 'dial':
      // Инициировать исходящий звонок через Twilio
      const twilioResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Calls.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: process.env.TWILIO_PHONE_NUMBER,
          To: phoneNumber,
          Url: `${process.env.N8N_WEBHOOK_URL}/webhook/voice-outbound`
        })
      });

      const callData = await twilioResponse.json();

      // Сохранить в базу
      await supabase.from('voice_calls').insert({
        call_sid: callData.sid,
        from_number: process.env.TWILIO_PHONE_NUMBER,
        to_number: phoneNumber,
        direction: 'outbound',
        status: 'initiated'
      });

      return NextResponse.json(callData);

    case 'hangup':
      // Положить трубку
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Calls/${callSid}.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          Status: 'completed'
        })
      });

      // Обновить статус в базе
      await supabase
        .from('voice_calls')
        .update({ status: 'completed' })
        .eq('call_sid', callSid);

      return NextResponse.json({ success: true });

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
```

---

## 🔄 Как работает непрерывный голосовой поток в n8n

### **Архитектура реального времени**

#### **1. WebSocket соединения**
n8n поддерживает WebSocket через специальные ноды:

```
Browser (Operator) ↔ n8n WebSocket Trigger ↔ Twilio Streams ↔ OpenAI Realtime
```

#### **2. Twilio Streams для bidirectional audio**
```xml
<!-- TwiML для bidirectional стрима -->
<Response>
  <Connect>
    <Stream url="wss://n8n.your-domain.com/voice-stream">
      <Parameter name="callSid" value="{{CallSid}}" />
    </Stream>
  </Connect>
</Response>
```

#### **3. n8n WebSocket Workflow**
```
WebSocket Trigger (/voice-stream)
    ↓
Function Node: Parse Audio Stream
    ↓
OpenAI Realtime Node (Streaming)
    ↓
Function Node: Process AI Response
    ↓
WebSocket Response: Send Audio Back
```

#### **4. Пример n8n WebSocket workflow**
```json
{
  "name": "Voice Stream Handler",
  "nodes": [
    {
      "parameters": {
        "path": "/voice-stream",
        "responseMode": "responseNode"
      },
      "type": "n8n-nodes-base.websocket",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "functionCode": `
          // Обработка входящего аудио потока
          const audioData = $input.first().json;

          // Отправка в OpenAI Realtime API
          const openaiResponse = await $node.openaiRealtime.process({
            audio: audioData,
            instructions: "You are a helpful voice assistant for AssetCare24..."
          });

          return {
            audioResponse: openaiResponse.audio,
            transcription: openaiResponse.text,
            intent: openaiResponse.intent
          };
        `
      },
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [460, 300]
    }
  ],
  "connections": {
    "WebSocket Trigger": {
      "main": [[{ "node": "Function", "type": "main", "index": 0 }]]
    },
    "Function": {
      "main": [[{ "node": "WebSocket", "type": "main", "index": 0 }]]
    }
  }
}
```

### **5. WebRTC в браузере оператора**
```typescript
// site/components/voice-operator-panel.tsx - WebRTC интеграция
class VoiceConnection {
  private peerConnection: RTCPeerConnection;
  private localStream: MediaStream;
  private remoteStream: MediaStream;

  async initializeConnection() {
    // Создание RTCPeerConnection
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    // Обработка ICE кандидатов
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Отправка кандидата в n8n
        this.sendToN8n('ice-candidate', event.candidate);
      }
    };

    // Обработка входящего потока
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      // Проигрывание в браузере
      remoteAudioRef.current.srcObject = this.remoteStream;
    };

    // Получение доступа к микрофону
    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    // Добавление локального потока
    this.localStream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, this.localStream);
    });
  }

  private sendToN8n(eventType: string, data: any) {
    // Отправка через WebSocket в n8n
    const ws = new WebSocket('wss://n8n.your-domain.com/webhook/voice-webrtc');
    ws.send(JSON.stringify({
      type: eventType,
      data: data,
      callSid: this.callSid
    }));
  }

  async startCall(phoneNumber: string) {
    // Создание offer
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    // Отправка offer в n8n -> Twilio
    this.sendToN8n('offer', offer);

    // Инициация звонка через API
    await fetch('/api/admin/voice', {
      method: 'POST',
      body: JSON.stringify({
        action: 'dial',
        phoneNumber: phoneNumber,
        offer: offer
      })
    });
  }

  hangup() {
    // Закрытие соединения
    this.peerConnection.close();
    this.localStream.getTracks().forEach(track => track.stop());
  }
}
```

---

## 🔄 Полный цикл голосового звонка

### **Входящий звонок:**

1. **Клиент звонит** → Twilio принимает звонок
2. **Twilio** → отправляет webhook в n8n с TwiML инструкциями
3. **n8n** → возвращает TwiML с `<Connect><Stream>` для bidirectional audio
4. **Twilio** → устанавливает WebSocket соединение с n8n
5. **n8n** → подключает OpenAI Realtime API
6. **OpenAI** → начинает слушать и отвечать в реальном времени
7. **Оператор** → может подключиться через браузер для прослушки/вмешательства

### **Исходящий звонок:**

1. **Оператор нажимает "Позвонить"** в браузере
2. **Browser** → создает WebRTC соединение
3. **API call** → Twilio инициирует звонок
4. **Twilio звонит клиенту** → клиент отвечает
5. **Twilio** → подключает Stream к n8n
6. **n8n** → маршрутизирует аудио между оператором и клиентом

---

## 🎛️ Управление гарнитурой

### **Web Audio API для контроля**
```typescript
class AudioManager {
  private audioContext: AudioContext;
  private microphone: MediaStreamAudioSourceNode;
  private gainNode: GainNode;
  private analyser: AnalyserNode;

  async initialize() {
    this.audioContext = new AudioContext();

    // Получение доступа к микрофону
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: 'default', // или ID конкретной гарнитуры
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    // Создание аудио нодов
    this.microphone = this.audioContext.createMediaStreamSource(stream);
    this.gainNode = this.audioContext.createGain();
    this.analyser = this.audioContext.createAnalyser();

    // Соединение цепочки
    this.microphone
      .connect(this.gainNode)
      .connect(this.analyser)
      .connect(this.audioContext.destination);
  }

  // Управление громкостью микрофона
  setMicrophoneVolume(volume: number) {
    this.gainNode.gain.value = volume / 100;
  }

  // Включение/выключение микрофона
  muteMicrophone(muted: boolean) {
    this.gainNode.gain.value = muted ? 0 : 1;
  }

  // Получение уровней звука для визуализации
  getAudioLevels(): { input: number, output: number } {
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    const inputLevel = dataArray.reduce((a, b) => a + b) / bufferLength;
    return {
      input: inputLevel / 255, // 0-1
      output: 0 // нужно отдельный анализатор для output
    };
  }

  // Выбор устройства
  async selectAudioDevice(deviceId: string) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: deviceId } }
    });

    // Переподключение источника
    this.microphone.disconnect();
    this.microphone = this.audioContext.createMediaStreamSource(stream);
    this.microphone.connect(this.gainNode);
  }

  // Получение списка устройств
  async getAudioDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'audioinput' || device.kind === 'audiooutput');
  }
}
```

---

## 🚀 Продакшн готовность

### **Мониторинг:**
- **Call logs** в Twilio Console
- **Recording storage** в Supabase
- **Error handling** в n8n workflows
- **Cost tracking** через Twilio API

### **Безопасность:**
- **Webhook validation** (проверка подписи Twilio)
- **Rate limiting** на n8n webhooks
- **PII encryption** для записей
- **Access control** для администраторов

### **Масштабируемость:**
- **Load balancing** для voice streams
- **Recording compression** для хранения
- **Caching** для частых запросов
- **Queue system** для обработки звонков

---

## 📞 Контакты и поддержка

### **Twilio Resources:**
- [Programmable Voice Docs](https://www.twilio.com/docs/voice)
- [TwiML Reference](https://www.twilio.com/docs/voice/twiml)
- [Voice Recording Guide](https://www.twilio.com/docs/voice/api/recording)

### **OpenAI Realtime:**
- [Realtime API Docs](https://platform.openai.com/docs/guides/realtime)
- [Voice Chat Example](https://github.com/openai/openai-realtime-api)

### **n8n Integration:**
- [Twilio Voice Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.twilio/)
- [Webhook Best Practices](https://docs.n8n.io/workflows/components/core-nodes/webhook/)

---

**Готов к реализации! Начать с базового приема звонков и записи разговоров?** 🎯
