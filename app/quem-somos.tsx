import React, { useState, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  useWindowDimensions,
  StyleSheet,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { RotateCcw } from "lucide-react-native";
import { AppFooter } from "@/components/AppFooter";
import { useTheme } from "@/hooks/useTheme";

// ── Data ──

const pastores = [
  {
    nome: "Rowilson Oliveira",
    cargo: "Apóstolo",
    foto: require("../assets/pastores/Apostolo.jpeg"),
    descricao:
      "São mais de 40 anos seguindo uma vida de entrega, visão espiritual e compromisso com o Reino. Ao longo de sua trajetória, tem impactado gerações com sua fé inabalável, liderança inspiradora e coração pastoral. Também é o principal levita do ministério, andando junto com as ovelhas e carregando o que for necessário para a obra crescer.",
  },
  {
    nome: "Cristiane de Oliveira",
    cargo: "Apóstola",
    foto: require("../assets/pastores/Apostola.jpeg"),
    descricao:
      "Ao lado do Apóstolo Rowilson, construiu uma aliança firme no ministério e na vida. Juntos, são pais de Isabelle e Samuel, uma família que reflete a presença e a união de Deus em cada detalhe. Sua dedicação e fé têm sido fundamentais na edificação da igreja e no cuidado com cada vida.",
  },
];

const valores = [
  {
    titulo: "Fé e Palavra",
    descricao:
      "Cremos na Bíblia Sagrada como a Palavra de Deus e fundamento de toda doutrina. Nossa fé é inabalável e guia cada passo do ministério.",
  },
  {
    titulo: "Comunhão e Discipulado",
    descricao:
      "Através das células e do convívio fraterno, cultivamos relacionamentos que fortalecem a fé, promovem o cuidado mútuo e formam discípulos comprometidos.",
  },
  {
    titulo: "Missões e Avivamento",
    descricao:
      "Somos chamados a alcançar nações. Levamos o Evangelho além das fronteiras, cruzando continentes com o propósito de transformar vidas pelo poder de Deus.",
  },
];

const ministerios = [
  {
    nome: "Infantil",
    logo: require("../assets/logos/resgatando.png"),
    descricao:
      '"Ensina a criança no caminho em que deve andar, e ainda quando for velho não se desviará dele." - Provérbios 22:6',
  },
  {
    nome: "Jovens",
    logo: require("../assets/logos/avivajovens.png"),
    descricao:
      '"Ninguém despreze a tua mocidade; mas sê o exemplo dos fiéis, na palavra, no trato, na caridade, no espírito, na fé, na pureza." - 1 Timóteo 4:12',
  },
  {
    nome: "Intercessão",
    emoji: "🙏",
    descricao: '"Orai sem cessar." - 1 Tessalonicenses 5:17',
  },
];

const associacao = {
  nome: "Associação Beneficente",
  logo: require("../assets/logos/ABER.png"),
  descricao:
    '"Cada um contribua segundo propôs no seu coração; não com tristeza, ou por necessidade; porque Deus ama ao que dá com alegria." — 2 Coríntios 9:7',
};

const equipes = [
  {
    nome: "Ganhar",
    emoji: "🎯",
    descricao:
      "Alcançar vidas para Cristo, levando o Evangelho a quem ainda não conhece o amor de Deus.",
  },
  {
    nome: "Consolidar",
    emoji: "🤝",
    descricao:
      "Acolher e fortalecer os novos convertidos, firmando-os na fé e na comunhão com a igreja.",
  },
  {
    nome: "Treinar",
    emoji: "📖",
    descricao:
      "Capacitar e equipar os membros para o serviço do Reino, através do ensino da Palavra.",
  },
  {
    nome: "Enviar",
    emoji: "🚀",
    descricao:
      "Levantar e enviar novos líderes e missionários para multiplicar o Evangelho em toda parte.",
  },
];

const grupos = [
  {
    nome: "TV Avivamento para as Nações",
    logo: require("../assets/logos/tvaviva.png"),
    descricao:
      "Responsável por registrar e transmitir os momentos da igreja, levando a mensagem do Evangelho através das plataformas digitais.",
  },
  {
    nome: "Web Rádio",
    logo: require("../assets/logos/webradio.png"),
    descricao:
      "Nossa rádio online que leva a Palavra de Deus, louvores e conteúdo edificante para ouvintes em qualquer lugar.",
  },
  {
    nome: "JOAN - Jornal Online",
    logo: require("../assets/logos/joan.png"),
    descricao:
      "Jornal Online Aviva News — levando informação, edificação e as notícias do ministério para todos os lugares.",
  },
  {
    nome: "Coreografia",
    emoji: "💃",
    descricao:
      '"Louvem o seu nome com danças." - Salmos 149:3. Adoração ao Senhor através da expressão corporal e da dança.',
  },
];

const gruposLouvor = [
  { nome: "Ebenézer", emoji: "🪨", descricao: '"Até aqui nos ajudou o Senhor." Grupo de louvor que levanta pedras de adoração, proclamando a fidelidade de Deus em cada nota.' },
  { nome: "Revive", emoji: "🔥", descricao: "Grupo de louvor que busca o avivamento através da adoração, trazendo renovação e o fogo do Espírito Santo a cada ministração." },
  { nome: "Rosas de Saron", emoji: "🌹", descricao: "Grupo de louvor que exala a fragrância da adoração, levando a beleza e a doçura da presença de Deus a cada momento." },
  { nome: "Levitas", emoji: "🛐", descricao: "Grupo de louvor dedicado ao serviço no altar, seguindo o exemplo dos levitas bíblicos na adoração consagrada ao Senhor." },
  { nome: "Emunah", emoji: "🕯️", descricao: 'Emunah significa "fé" em hebraico. Grupo de louvor que adora com convicção e fidelidade, declarando as promessas de Deus.' },
  { nome: "Elohim", emoji: "👑", descricao: "Elohim, um dos nomes de Deus. Grupo de louvor que exalta a grandeza e a soberania do Criador em cada adoração." },
  { nome: "Efraim", emoji: "🌿", descricao: 'Efraim significa "frutífero". Grupo de louvor que busca produzir frutos de adoração que glorifiquem o nome do Senhor.' },
  { nome: "El Elion", emoji: "⭐", descricao: "El Elion, o Deus Altíssimo. Grupo de louvor que eleva a adoração ao lugar mais alto, reconhecendo a majestade de Deus." },
  { nome: "Maranata", emoji: "✝️", descricao: '"Maranata, ora vem Senhor Jesus!" Grupo de louvor que vive na expectativa da volta de Cristo, adorando com urgência e paixão.' },
];

// ── Flip Card for Pastor ──

function PastorCard({ pastor, c }: { pastor: typeof pastores[0]; c: Record<string, string> }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const handleFlip = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  return (
    <Pressable onPress={handleFlip} style={s.flipContainer}>
      {/* Front - Photo */}
      <Animated.View
        style={[
          s.flipFace,
          s.flipCardRounded,
          { transform: [{ perspective: 1000 }, { rotateY: frontRotate }] },
        ]}
      >
        <Image
          source={pastor.foto}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={s.pastorGradient}
        >
          <Text style={s.pastorName}>{pastor.nome}</Text>
          <Text style={s.pastorCargo}>{pastor.cargo}</Text>
        </LinearGradient>
        <View style={s.flipIndicator}>
          <RotateCcw size={20} color="#ffffff" />
        </View>
      </Animated.View>

      {/* Back - Description */}
      <Animated.View
        style={[
          s.flipFace,
          s.flipCardRounded,
          { backgroundColor: c.cardBg, borderWidth: 1, borderColor: c.cardBorder },
          { transform: [{ perspective: 1000 }, { rotateY: backRotate }] },
        ]}
      >
        <View style={s.backContent}>
          <View style={s.letterAvatar}>
            <Text style={s.letterAvatarText}>
              {pastor.nome.charAt(0)}
            </Text>
          </View>
          <Text style={[s.backName, { color: c.foreground }]}>{pastor.nome}</Text>
          <Text style={s.backCargo}>{pastor.cargo}</Text>
          <View style={s.backDivider} />
          <Text style={[s.backDesc, { color: c.muted }]}>{pastor.descricao}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ── Logo/Emoji Circle ──

function LogoCircle({ logo, emoji, size = 80, bgColor }: { logo?: any; emoji?: string; size?: number; bgColor: string }) {
  return (
    <View style={[s.logoCircle, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }]}>
      {logo ? (
        <Image source={logo} style={{ width: size * 0.7, height: size * 0.7 }} contentFit="contain" />
      ) : (
        <Text style={{ fontSize: 36 }}>{emoji}</Text>
      )}
    </View>
  );
}

// ── Main Screen ──

export default function QuemSomosScreen() {
  const { width } = useWindowDimensions();
  const { isDark } = useTheme();

  // Dark-mode adaptive colors
  const c = {
    bg: isDark ? "#0e1219" : "#ffffff",
    foreground: isDark ? "#f1f5f9" : "#1e293b",
    muted: isDark ? "#94a3b8" : "#64748b",
    primary: isDark ? "#60a5fa" : "#1e3a5f",
    accent: "#d4922a",
    cardBg: isDark ? "#1e293b" : "#ffffff",
    cardBorder: isDark ? "#334155" : "#f1f5f9",
    mutedBg: isDark ? "#334155" : "#f1f5f9",
    valorCircleBg: isDark ? "rgba(212,146,42,0.15)" : "#fef3c7",
    valorNumber: isDark ? "#fbbf24" : "#d4922a",
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 48, paddingBottom: 48 }}>

        {/* ── Hero ── */}
        <View style={{ alignItems: "center", marginBottom: 64 }}>
          <Text style={[s.heroTitle, { color: c.primary }]}>Quem Somos</Text>
          <Text style={[s.heroSubtitle, { color: c.muted }]}>
            Conheça nossa história, missão e a equipe que lidera nossa igreja
          </Text>
        </View>

        {/* ── Nossa História ── */}
        <View style={{ marginBottom: 64 }}>
          <View style={[s.cardMedium, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
            <Text style={[s.h2Primary, { color: c.primary }]}>Nossa História</Text>
            <Text style={[s.proseLg, { color: c.muted }]}>
              A Igreja Evangélica Avivamento para as Nações teve seu início de uma forma simples, em um bairro humilde, mas que com o passar dos anos foi crescendo e se fortalecendo, dando origem a diversos sonhos e projetos que hoje estão se concretizando.
            </Text>
            <Text style={[s.proseLg, { color: c.muted }]}>
              Uma viagem à Colômbia foi um marco transformador, onde o modelo de igreja em célula foi aprendido. Essa visão transformou nossa igreja, trazendo crescimento espiritual, comunhão e multiplicação. As células se tornaram locais de cuidado, discipulado e fortalecimento da fé.
            </Text>
            <Text style={[s.proseLg, { color: c.muted }]}>
              Hoje, com sede na Rua Lucas Padilha, 07, Jardim Ester, Zona Oeste de São Paulo, a igreja é o ponto mais ativo do ministério, com cultos diários, reuniões, treinamentos, vigílias e a Web Rádio. Sempre pensando nas vidas que o Senhor acrescenta e no crescimento do ministério, outros espaços surgiram com a direção de Deus: um acampamento para retiros espirituais, o espaço em Embu das Artes com capacidade para 1.000 pessoas, a área em Itapecerica da Serra e a base missionária em Caldas, Minas Gerais.
            </Text>
            <Text style={[s.proseLg, { color: c.muted, marginBottom: 0 }]}>
              O chamado missionário também ultrapassou fronteiras, com missões em Israel, Argentina, Estados Unidos, Moçambique e Malawi, levando avivamento e o Evangelho aonde o Senhor manda ir.
            </Text>
          </View>
        </View>

        {/* ── Missão e Visão ── */}
        <View style={{ marginBottom: 64 }}>
          <View style={{ gap: 24 }}>
            <View style={[s.cardSoft, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
              <Text style={[s.h2Card, { color: c.primary }]}>Nossa Missão</Text>
              <Text style={[s.bodyText, { color: c.muted }]}>
                Prestar culto a Deus, promover a pregação da Palavra de Deus, ministrar aos seus discipulos como viver em santidade que os levam a viver de conformidade com a vontade de Deus, fazer discípulos e instruí-los no ensino e na prática de toda a doutrina bíblica.
              </Text>
            </View>
            <View style={[s.cardSoft, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
              <Text style={[s.h2Card, { color: c.accent }]}>Nossa Visão</Text>
              <Text style={[s.bodyText, { color: c.muted }]}>
                Ser uma igreja que rompe barreiras e alcança nações, transformando vidas através do poder do Evangelho, formando discípulos e expandindo o Reino de Deus além das fronteiras.
              </Text>
            </View>
          </View>
        </View>

        {/* ── Nossos Valores ── */}
        <View style={{ marginBottom: 64 }}>
          <Text style={[s.h2Center, { color: c.foreground }]}>Nossos Valores</Text>
          <View style={{ gap: 24 }}>
            {valores.map((valor, i) => (
              <View key={i} style={[s.cardSoft, { alignItems: "center", backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
                <View style={[s.valorCircle, { backgroundColor: c.valorCircleBg }]}>
                  <Text style={[s.valorNumber, { color: c.valorNumber }]}>{i + 1}</Text>
                </View>
                <Text style={[s.h3, { color: c.foreground }]}>{valor.titulo}</Text>
                <Text style={[s.bodyText, { textAlign: "center", color: c.muted }]}>{valor.descricao}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Nossa Liderança ── */}
        <View style={{ marginBottom: 64 }}>
          <Text style={[s.h2Center, { color: c.foreground }]}>Nossa Liderança</Text>
          {pastores.map((pastor, i) => (
            <PastorCard key={i} pastor={pastor} c={c} />
          ))}
        </View>

        {/* ── Nossos Ministérios ── */}
        <View style={{ marginBottom: 64 }}>
          <Text style={[s.h2Center, { color: c.foreground }]}>Nossos Ministérios</Text>
          <View style={{ gap: 24 }}>
            {ministerios.map((m) => (
              <View key={m.nome} style={[s.cardSoft, { alignItems: "center", backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
                <LogoCircle logo={"logo" in m ? m.logo : undefined} emoji={"emoji" in m ? m.emoji : undefined} bgColor={c.mutedBg} />
                <Text style={[s.h3Sm, { color: c.foreground }]}>{m.nome}</Text>
                <Text style={[s.smText, { textAlign: "center", color: c.muted }]}>{m.descricao}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Nossa Associação ── */}
        <View style={{ marginBottom: 64 }}>
          <Text style={[s.h2Center, { color: c.foreground }]}>Nossa Associação</Text>
          <View style={[s.cardSoft, { alignItems: "center", backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
            <LogoCircle logo={associacao.logo} bgColor={c.mutedBg} />
            <Text style={[s.h3Sm, { color: c.foreground }]}>{associacao.nome}</Text>
            <Text style={[s.smText, { textAlign: "center", color: c.muted }]}>{associacao.descricao}</Text>
          </View>
        </View>

        {/* ── Nossas Equipes ── */}
        <View style={{ marginBottom: 64 }}>
          <Text style={[s.h2Center, { color: c.foreground }]}>Nossas Equipes</Text>
          <View style={{ gap: 24 }}>
            {equipes.map((e) => (
              <View key={e.nome} style={[s.cardSoft, { alignItems: "center", backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
                <LogoCircle emoji={e.emoji} bgColor={c.mutedBg} />
                <Text style={[s.h3Sm, { color: c.foreground }]}>{e.nome}</Text>
                <Text style={[s.smText, { textAlign: "center", color: c.muted }]}>{e.descricao}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Nossos Grupos ── */}
        <View style={{ marginBottom: 64 }}>
          <Text style={[s.h2Center, { color: c.foreground }]}>Nossos Grupos</Text>
          <View style={{ gap: 24 }}>
            {grupos.map((g) => (
              <View key={g.nome} style={[s.cardSoft, { alignItems: "center", backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
                <LogoCircle logo={"logo" in g ? g.logo : undefined} emoji={"emoji" in g ? g.emoji : undefined} bgColor={c.mutedBg} />
                <Text style={[s.h3Sm, { color: c.foreground }]}>{g.nome}</Text>
                <Text style={[s.smText, { textAlign: "center", color: c.muted }]}>{g.descricao}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Nossos Grupos de Louvor ── */}
        <View>
          <Text style={[s.h2Center, { color: c.foreground }]}>Nossos Grupos de Louvor</Text>
          <View style={{ gap: 24 }}>
            {gruposLouvor.map((g) => (
              <View key={g.nome} style={[s.cardSoft, { alignItems: "center", backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
                <LogoCircle emoji={g.emoji} bgColor={c.mutedBg} />
                <Text style={[s.h3Sm, { color: c.foreground }]}>{g.nome}</Text>
                <Text style={[s.smText, { textAlign: "center", color: c.muted }]}>{g.descricao}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <AppFooter />
    </ScrollView>
  );
}

// ── Styles ──

const s = StyleSheet.create({
  // text-4xl = 36px
  heroTitle: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  // text-lg = 18px
  heroSubtitle: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 28,
    maxWidth: 500,
  },
  // text-3xl = 30px, mb-8 = 32px
  h2Center: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
  },
  // text-3xl = 30px, mb-6 = 24px
  h2Primary: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 24,
  },
  // text-2xl = 24px, mb-4 = 16px
  h2Card: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  // text-xl = 20px (for valores)
  h3: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  // text-lg = 18px (for ministerios, equipes, grupos — web uses text-lg)
  h3Sm: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  // prose prose-lg = 18px
  proseLg: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 16,
  },
  // 16px body
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
  },
  // text-sm = 14px
  smText: {
    fontSize: 14,
    lineHeight: 22,
  },

  // shadow-medium, p-8
  cardMedium: {
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  // shadow-soft, p-6
  cardSoft: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  // w-16 h-16 = 64px
  valorCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  // text-2xl = 24px
  valorNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },

  // h-[400px]
  flipContainer: {
    height: 400,
    marginBottom: 32,
  },
  flipFace: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: "hidden",
  },
  flipCardRounded: {
    borderRadius: 16,
    overflow: "hidden",
  },
  pastorGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 80,
  },
  pastorName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  pastorCargo: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
    marginTop: 4,
  },
  flipIndicator: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    padding: 8,
  },
  backContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  letterAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1e3a5f",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  letterAvatarText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#ffffff",
  },
  backName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  backCargo: {
    fontSize: 14,
    color: "#d4922a",
    fontWeight: "500",
    marginBottom: 16,
  },
  backDivider: {
    width: 48,
    height: 4,
    backgroundColor: "#1e3a5f",
    borderRadius: 2,
    marginBottom: 16,
  },
  backDesc: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },

  // w-20 h-20 = 80px, rounded-full
  logoCircle: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 16,
  },
});
