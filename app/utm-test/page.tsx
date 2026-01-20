'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, QrCode, Users, Building, Globe, Instagram, Facebook } from 'lucide-react';

interface SourceCodeConfig {
  source: 'WB' | 'QR';
  userType: 'C' | 'M';
  clientType: 'C' | 'P' | '0';
  code: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const sourceCodeConfigs: SourceCodeConfig[] = [
  {
    source: 'QR',
    userType: 'C',
    clientType: 'C',
    code: '00001',
    description: 'Контрактный клиент QR №1',
    icon: <QrCode className="w-4 h-4" />,
    color: 'bg-blue-500'
  },
  {
    source: 'QR',
    userType: 'C',
    clientType: 'C',
    code: '00002',
    description: 'Контрактный клиент QR №2',
    icon: <QrCode className="w-4 h-4" />,
    color: 'bg-orange-500'
  },
  {
    source: 'QR',
    userType: 'C',
    clientType: 'P',
    code: '00000',
    description: 'Публичный клиент QR',
    icon: <QrCode className="w-4 h-4" />,
    color: 'bg-green-500'
  },
  {
    source: 'QR',
    userType: 'M',
    clientType: 'C',
    code: '00001',
    description: 'Работник контракт 00001',
    icon: <Users className="w-4 h-4" />,
    color: 'bg-purple-500'
  }
];

export default function UTMTestPage() {
  const generateSourceCode = (config: SourceCodeConfig): string => {
    return `||-R-${config.source}-${config.userType}-${config.clientType}-${config.code.padStart(5, '0')}-||`;
  };

  const generateWhatsAppLink = (config: SourceCodeConfig): string => {
    // Используем новую утилиту с фиксированным немецким текстом
    return `https://wa.me/14155238886?text=${encodeURIComponent(
      `Hallo! Bitte senden Sie diese Nachricht mit dem Registrierungscode, ohne ihn zu bearbeiten!

${generateSourceCode(config)}

Danke!`
    )}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              SRC-Коды для тестирования WhatsApp
            </h1>
            <p className="text-muted-foreground text-lg">
              Техническая страница для тестирования нового стандарта кодов источника
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-mono">
                Формат кода: <code className="bg-background px-2 py-1 rounded">SRC-{`{SOURCE}`}-{`{CAMPAIGN}`}-{`{DATE}`}-{`{NONCE}`}</code>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Пример: SRC-WEB-MAIN-20260114-AB3F → Клиент с главной страницы сайта
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sourceCodeConfigs.map((config, index) => {
              const whatsappLink = generateWhatsAppLink(config);
              const sourceCode = generateSourceCode(config);

              return (
                <Card key={index} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={config.userType === 'C' ? 'default' : 'secondary'}>
                        {config.userType === 'C' ? 'Клиент' : 'Мастер'}
                      </Badge>
                      <div className={`w-3 h-3 rounded-full ${config.color}`} />
                    </div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {config.icon}
                      {config.description}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Код источника:</div>
                      <div className="font-mono text-sm bg-muted p-2 rounded break-all">
                        {sourceCode}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">WhatsApp сообщение:</div>
                      <div className="font-mono text-xs bg-muted p-2 rounded break-all max-h-32 overflow-hidden">
                        Hallo! Bitte senden Sie diese Nachricht mit dem Registrierungscode, ohne ihn zu bearbeiten!<br/>
                        <br/>
                        {sourceCode}<br/>
                        <br/>
                        Danke!
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        asChild
                        className="flex-1"
                        size="sm"
                      >
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            // GA4 событие для тестирования
                            if (typeof window !== 'undefined' && window.gtag) {
                              window.gtag('event', 'click', {
                                event_category: 'whatsapp_test',
                                event_label: 'utm_test_button',
                                custom_parameter_source: config.source,
                                custom_parameter_user_type: config.userType
                              });
                            }
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Тестировать
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(whatsappLink)}
                      >
                        Копировать
                      </Button>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="text-xs text-muted-foreground">
                        Источник: <span className="font-medium">{config.source === 'WB' ? 'Сайт' : 'QR-код'}</span><br/>
                        Тип: <span className="font-medium">{config.userType === 'C' ? 'Клиент' : 'Мастер'}</span><br/>
                        Категория: <span className="font-medium">
                          {config.clientType === 'C' ? 'Контрактный' :
                           config.clientType === 'P' ? 'Публичный' : 'Н/Д'}
                        </span><br/>
                        Код: <span className="font-medium">{config.code}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 p-6 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Как использовать:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Выберите нужный тип пользователя (клиент/мастер) и источник (сайт/QR)</li>
              <li>Нажмите "Тестировать" для проверки генерации WhatsApp ссылки</li>
              <li>Проверьте, что код источника корректно отображается в сообщении</li>
              <li>Используйте для тестирования парсинга в n8n workflows</li>
            </ol>

            <div className="mt-4 p-4 bg-background rounded border">
              <h4 className="font-medium mb-2">Примеры кодов:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <div className="font-medium text-blue-600">||-R-QR-C-C-00001-||</div>
                  <div className="text-muted-foreground">→ Контрактный клиент через QR</div>
                </div>
                <div>
                  <div className="font-medium text-green-600">||-R-QR-C-P-00000-||</div>
                  <div className="text-muted-foreground">→ Публичный клиент через QR</div>
                </div>
                <div>
                  <div className="font-medium text-purple-600">||-R-QR-M-C-00001-||</div>
                  <div className="text-muted-foreground">→ Работник контракт 00001</div>
                </div>
                <div>
                  <div className="font-medium text-gray-600">||-R-WB-M-0-00001-||</div>
                  <div className="text-muted-foreground">→ Регистрация мастера с сайта</div>
                </div>
                <div>
                  <div className="font-medium text-orange-600">||-R-WB-C-C-00123-||</div>
                  <div className="text-muted-foreground">→ Контрактный клиент с сайта</div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Парсинг в n8n:</h4>
              <div className="text-xs font-mono bg-blue-100 dark:bg-blue-900 p-2 rounded">
                <div>// Регулярное выражение для парсинга:</div>
                <div className="text-blue-600">\|\|-R-([A-Z]&#123;2&#125;)-([CM])-([CP0])-(\d&#123;5&#125;)-\|\|</div>
                <div className="mt-2">// Пример парсинга:</div>
                <div className="text-blue-600">||-R-QR-C-C-00001-|| → ['QR', 'C', 'C', '00001']</div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
              <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">Структура кода:</h4>
              <div className="text-xs space-y-1">
                <div><strong>||-R-</strong> — префикс для распознавания</div>
                <div><strong>{`{WB|QR}`}</strong> — источник: сайт или QR-код</div>
                <div><strong>{`{C|M}`}</strong> — тип: клиент или мастер</div>
                <div><strong>{`{C|P|0}`}</strong> — категория: контрактный/публичный/н/д</div>
                <div><strong>{`{XXXXX}`}</strong> — 5-ти значный код</div>
                <div><strong>-||</strong> — суффикс для распознавания</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
