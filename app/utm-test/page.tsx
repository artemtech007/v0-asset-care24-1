'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, QrCode, Users, Building } from 'lucide-react';

interface UTMConfig {
  type: 'contract' | 'public';
  number: number;
  source: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const utmConfigs: UTMConfig[] = [
  {
    type: 'contract',
    number: 1,
    source: 'qr',
    description: 'Контрактный клиент - Дом №1 (QR-код)',
    icon: <QrCode className="w-4 h-4" />,
    color: 'bg-blue-500'
  },
  {
    type: 'public',
    number: 1,
    source: 'ad1',
    description: 'Публичный клиент - Реклама 1 (Google/Facebook)',
    icon: <Users className="w-4 h-4" />,
    color: 'bg-green-500'
  },
  {
    type: 'public',
    number: 2,
    source: 'ad2',
    description: 'Публичный клиент - Реклама 2 (Instagram/TikTok)',
    icon: <Users className="w-4 h-4" />,
    color: 'bg-purple-500'
  },
  {
    type: 'contract',
    number: 2,
    source: 'qr',
    description: 'Контрактный клиент - Комплекс A (QR-код)',
    icon: <Building className="w-4 h-4" />,
    color: 'bg-orange-500'
  },
  {
    type: 'public',
    number: 3,
    source: 'organic',
    description: 'Публичный клиент - Органический трафик (сайт)',
    icon: <ExternalLink className="w-4 h-4" />,
    color: 'bg-red-500'
  }
];

export default function UTMTestPage() {
  const generateWhatsAppLink = (config: UTMConfig) => {
    const utmTag = `${config.type}_${config.number}_${config.source}`;
    const message = `${utmTag}_request`;
    return `https://wa.me/491510416555?text=${encodeURIComponent(message)}`;
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
              UTM-Метки для тестирования WhatsApp
            </h1>
            <p className="text-muted-foreground text-lg">
              Техническая страница для тестирования маршрутизации клиентов по категориям
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-mono">
                Формат метки: <code className="bg-background px-2 py-1 rounded">type_number_source_request</code>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Пример: contract_1_qr_request → Контрактный клиент из дома №1 через QR
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {utmConfigs.map((config, index) => {
              const whatsappLink = generateWhatsAppLink(config);
              const utmTag = `${config.type}_${config.number}_${config.source}_request`;

              return (
                <Card key={index} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={config.type === 'contract' ? 'default' : 'secondary'}>
                        {config.type === 'contract' ? 'Контрактный' : 'Публичный'}
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
                      <div className="text-sm font-medium">UTM-метка:</div>
                      <div className="font-mono text-sm bg-muted p-2 rounded break-all">
                        {utmTag}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">WhatsApp ссылка:</div>
                      <div className="font-mono text-xs bg-muted p-2 rounded break-all">
                        {whatsappLink}
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
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Открыть WhatsApp
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
                        Категория: <span className="font-medium capitalize">{config.type}</span><br/>
                        Номер: <span className="font-medium">{config.number}</span><br/>
                        Источник: <span className="font-medium">{config.source}</span>
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
              <li>Выберите нужную категорию клиента (контрактный/публичный)</li>
              <li>Нажмите "Открыть WhatsApp" для тестирования маршрутизации</li>
              <li>Проверьте, правильно ли определена категория в логах системы</li>
              <li>Используйте QR-коды для реальных клиентов на местах</li>
            </ol>

            <div className="mt-4 p-4 bg-background rounded border">
              <h4 className="font-medium mb-2">Тестирование маршрутизации:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="font-medium text-blue-600">Contract + QR</div>
                  <div className="text-muted-foreground">→ Существующие клиенты компании</div>
                </div>
                <div>
                  <div className="font-medium text-green-600">Public + Ad1</div>
                  <div className="text-muted-foreground">→ Новые клиенты с рекламы</div>
                </div>
                <div>
                  <div className="font-medium text-purple-600">Public + Ad2</div>
                  <div className="text-muted-foreground">→ Другие рекламные каналы</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
