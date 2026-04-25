import { useState, useMemo } from "react";
import { Search, MessageCircle } from "lucide-react";
import { WhatsappContact } from "@/hooks/useWhatsappContacts";
import { formatSaudiPhoneDisplay } from "@/lib/phoneNormalize";

interface Props {
  contacts: WhatsappContact[];
  selectedPhone: string | null;
  onSelect: (phone: string) => void;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "الآن";
  if (min < 60) return `${min}د`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}س`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}ي`;
  return new Date(iso).toLocaleDateString("ar-SA", { day: "2-digit", month: "2-digit" });
}

const tierEmoji: Record<string, string> = {
  gold: "👑",
  silver: "🥈",
  regular: "👤",
};

export default function ContactsList({ contacts, selectedPhone, onSelect }: Props) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "active">("all");

  const filtered = useMemo(() => {
    let list = contacts;
    if (filter === "unread") list = list.filter((c) => c.unreadCount > 0);
    if (filter === "active") list = list.filter((c) => c.lastMessageAt);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.phone.includes(needle.replace(/\D/g, "")) ||
          (c.name ?? "").toLowerCase().includes(needle),
      );
    }
    return list;
  }, [contacts, q, filter]);

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="بحث بالاسم أو الرقم…"
            className="w-full bg-background border border-border rounded-xl pr-9 pl-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-1.5 mt-2">
          {[
            { id: "all", label: "الكل", count: contacts.length },
            { id: "unread", label: "غير مقروء", count: contacts.filter((c) => c.unreadCount > 0).length },
            { id: "active", label: "نشطة", count: contacts.filter((c) => c.lastMessageAt).length },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as typeof filter)}
              className={`text-[10px] px-2.5 py-1 rounded-full transition-all ${
                filter === f.id
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
            <MessageCircle size={32} className="mb-2 opacity-40" />
            <div className="text-[12px]">لا توجد جهات اتصال</div>
          </div>
        ) : (
          filtered.map((c) => {
            const isSelected = selectedPhone === c.phone;
            return (
              <button
                key={c.phone}
                onClick={() => onSelect(c.phone)}
                className={`w-full text-right px-3 py-3 flex items-center gap-3 border-b border-border transition-colors ${
                  isSelected ? "bg-primary/10" : "hover:bg-muted/50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-[16px] shrink-0">
                  {c.tier ? tierEmoji[c.tier] ?? "👤" : "💬"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[12px] font-semibold text-foreground truncate">
                      {c.name || formatSaudiPhoneDisplay(c.phone)}
                    </div>
                    <div className="text-[9px] text-muted-foreground shrink-0">
                      {timeAgo(c.lastMessageAt)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <div className="text-[10px] text-muted-foreground truncate">
                      {c.lastDirection === "outbound" && "↗ "}
                      {c.lastMessage ?? "لم يتم التواصل بعد"}
                    </div>
                    {c.unreadCount > 0 && (
                      <div className="bg-success text-primary-foreground text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1.5 shrink-0">
                        {c.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
