export interface Artwork {
  id: number;
  title: string;
  artist: string;
  size: string;
  medium: string;
  price: string;
  status: "Available" | "Reserved" | "Sold Out";
  image: string;
  description?: string;
}

export const artworks: Artwork[] = [
  {
    id: 1,
    title: "오현단의 햇살 I (Sunlight of Ohyeondan I)",
    artist: "오현단길 레지던시 작가",
    size: "70 × 70 cm",
    medium: "Canvas with Gold Leaf & Mixed Media",
    price: "1,200,000 KRW",
    status: "Available",
    image: "/images/interior_wall.jpg",
    description: "제주 이도1동 오현단 성곽 틈 사이로 비치는 따스한 빛줄기를 조형적인 황금빛 입체 텍스처로 시각화한 작품입니다. 귤림서원의 고즈넉한 온기와 시간의 켜가 금박(Gold Leaf) 마티에르의 대담한 터치 속에 조화롭게 녹아 있습니다."
  },
  {
    id: 2,
    title: "제주 돌담의 텍스처 (Stone Wall Texture)",
    artist: "로컬 컬래버레이터",
    size: "50 × 50 cm",
    medium: "Acrylic & Modeling Paste on Canvas",
    price: "850,000 KRW",
    status: "Reserved",
    image: "/images/interior_detail.jpg",
    description: "제주의 거칠면서도 따뜻한 돌담 질감을 아크릴과 모델링 페이스트의 두터운 붓터치로 구현하였습니다. 제주시 구도심 골목길의 역사와 돌담의 묵직한 촉각성을 복원하려는 작가의 깊은 탐색이 담겨 있습니다."
  },
  {
    id: 3,
    title: "바람과 구도심 (Wind & Old Town)",
    artist: "오현단길 레지던시 작가",
    size: "90 × 60 cm",
    medium: "Mixed Media with Gold Relief",
    price: "1,500,000 KRW",
    status: "Available",
    image: "/images/interior_table.jpg",
    description: "삼성혈에서 제이각으로 이어지는 문화적 흐름과 바람의 궤적을 캔버스 위에 자유로운 금빛 부조(Relief) 선으로 기록한 지적 추상 회화입니다. 제주 구도심의 유구한 시간적 서사를 우아한 곡선과 여백으로 완성하였습니다."
  },
  {
    id: 4,
    title: "오현길 모퉁이 (Ohyuon Road Corner)",
    artist: "어반 스케치 강사 대표작",
    size: "40 × 40 cm",
    medium: "Pen and Acrylic on Wood Panel",
    price: "450,000 KRW",
    status: "Sold Out",
    image: "/images/exterior.jpg",
    description: "표구사거리와 액자공방, 자수 공방이 모이던 이도1동의 따뜻한 공예 역사를 계승하여, 갤러리 오현단길이 위치한 성곽 모퉁이길의 아기자기한 정취를 펜과 아크릴 선으로 밀도 있게 잡아낸 상징적 드로잉입니다."
  }
];
