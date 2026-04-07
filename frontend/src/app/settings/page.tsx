"use client";

import { useState } from "react";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-surface-card rounded-2xl border border-border p-6 shadow-card ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="section-title">{children}</h2>;
}

export default function SettingsPage() {
  const [tz, setTz] = useState("Europe/Moscow");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight text-ink">
        Настройки и натальный профиль
      </h1>

      <Card>
        <SectionLabel>Натальная карта (D1)</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {[
            ["Лагна", "Стрелец 25°05′ (Пурва Ашадха, пада 4)"],
            ["Солнце", "Овен 24°20′ (Бхарани, пада 4)"],
            ["Луна", "Близнецы 2°55′ (Мригашира, пада 3)"],
            ["Марс", "Телец 20°12′ (Рохини, пада 4)"],
            ["Меркурий", "Овен 25°10′ (R, Атмакарака)"],
            ["Юпитер", "Весы 5°31′ (R)"],
            ["Венера", "Телец 19°53′ (свой знак)"],
            ["Сатурн", "Овен 19°26′ (дебилитация)"],
            ["Раху", "Водолей 15°41′"],
            ["Кету", "Лев 15°41′"],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <span className="text-ink-tertiary w-24 shrink-0">{label}</span>
              <span className="text-ink">{value}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionLabel>Часовой пояс</SectionLabel>
        <select
          value={tz}
          onChange={(e) => setTz(e.target.value)}
          className="rounded-xl border border-border bg-surface-card px-4 py-2.5 text-sm text-ink w-full focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/40"
        >
          <option value="Europe/Moscow">Europe/Moscow (UTC+3)</option>
          <option value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</option>
          <option value="Europe/London">Europe/London (UTC+0/+1)</option>
        </select>
      </Card>

      <Card>
        <SectionLabel>Фиксированные правила питания</SectionLabel>
        <ul className="text-sm text-ink space-y-2 leading-relaxed">
          <li>Завтрак: 1 яйцо с жидким желтком, банан или 2 финика, 5 черри, 25–30 г листового салата, кофе со специями</li>
          <li>Только 1 яйцо в день, только на завтрак</li>
          <li>После 18:00 еды нет</li>
          <li className="text-ink-secondary">
            Исключены: маш, овсянка, тыква, индейка, свинина, авокадо, кинза, перловка
          </li>
          <li>Белок: курица, телятина, говядина, форель, лосось, минтай, треска, печень говяжья, печень куриная</li>
          <li>Овощи: кабачок, цветная капуста, брокколи, сладкий перец, помидоры, баклажаны, стручковая фасоль, белокочанная капуста, пекинская капуста, морковь, немного свёклы, салатные листья</li>
        </ul>
      </Card>

      <Card>
        <SectionLabel>Нутрицевтики</SectionLabel>
        <ul className="text-sm space-y-2 leading-relaxed">
          {[
            ["После завтрака", "L-теанин, женолутен"],
            ["С обедом", "Омега-3, пиколинат хрома, берберин, витамин D + K2, селен"],
            ["Днём отдельно", "Цинк"],
            ["Вечером", "Магний бисглицинат, ГАМК 500 мг, 5-HTP 120 мг"],
            ["Эндолутен", "1 раз в 3 дня, первая половина дня"],
          ].map(([time, items]) => (
            <li key={time}>
              <span className="text-ink-secondary font-medium">{time}:</span>{" "}
              <span className="text-ink">{items}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <SectionLabel>Щитовидная безопасность</SectionLabel>
        <ul className="text-sm text-ink-secondary space-y-1.5 leading-relaxed">
          <li>Йод и тирозин исключены из нутрицевтической поддержки</li>
          <li>Йодосодержащие добавки, водоросли и келп не добавляются без назначения врача</li>
          <li>Селен — только в составе утверждённых добавок</li>
          <li>Консервативный режим: стабильное время еды, без эскалации стимуляторов</li>
        </ul>
      </Card>
    </div>
  );
}
