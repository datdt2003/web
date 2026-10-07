export type RegionId = "bac" | "trung" | "nam"

export interface Region {
  id: RegionId
  label: string
  short: string
}

export const regions: Region[] = [
  { id: "bac", label: "Miền Bắc", short: "Miền Bắc" },
  { id: "trung", label: "Miền Trung", short: "Miền Trung" },
  { id: "nam", label: "Miền Nam", short: "Miền Nam" },
]

export interface Ethnic {
  slug: string
  name: string
  altNames?: string
  region: RegionId
  regions?: RegionId[]
  residenceArea?: string
  population: number
  languageFamily: string
  image: string
  blurb: string
  detail: string
  culture: string[]
  videoUrl?: string
}

const IMG = {
  kinh: "/images/ethnic-kinh.png",
  hmong: "/images/ethnic-hmong.png",
  thai: "/images/ethnic-thai.png",
  cham: "/images/ethnic-cham.png",
  khmer: "/images/ethnic-khmer.png",
  ede: "/images/ethnic-ede.png",
  tay: "/images/ethnic-tay.png",
  dao: "/images/ethnic-dao.png",
}

const D = (s: string) => s

export const ethnicGroups: Ethnic[] = [
  {
    slug: "kinh",
    name: "Kinh",
    altNames: "Việt",
    region: "bac",
    regions: ["bac", "trung", "nam"],
    population: 82085826,
    languageFamily: "Việt – Mường",
    image: IMG.kinh,
    blurb: "Dân tộc đa số, cư trú khắp cả nước, cái nôi của nền văn minh lúa nước sông Hồng.",
    detail:
      "Người Kinh (Việt) là dân tộc đông dân nhất Việt Nam, sinh sống chủ yếu ở các vùng đồng bằng, ven biển và đô thị. Nền văn hóa lúa nước, tín ngưỡng thờ cúng tổ tiên và hệ thống lễ hội truyền thống là những đặc trưng nổi bật.",
    culture: ["Áo dài", "Tết Nguyên Đán", "Hát chèo, quan họ", "Văn hóa lúa nước"],
  },
  {
    slug: "tay",
    name: "Tày",
    region: "bac",
    population: 1845492,
    languageFamily: "Tày – Thái",
    image: IMG.tay,
    blurb: "Dân tộc thiểu số đông nhất, nổi tiếng với làn điệu hát Then và cây đàn tính.",
    detail:
      "Người Tày cư trú tập trung ở các tỉnh miền núi phía Bắc như Cao Bằng, Lạng Sơn, Tuyên Quang. Họ sống trong những ngôi nhà sàn ven thung lũng và gìn giữ nghệ thuật hát Then – di sản văn hóa phi vật thể của nhân loại.",
    culture: ["Hát Then", "Đàn tính", "Nhà sàn", "Lễ hội Lồng Tồng"],
  },
  {
    slug: "thai",
    name: "Thái",
    region: "bac",
    population: 1820950,
    languageFamily: "Tày – Thái",
    image: IMG.thai,
    blurb: "Chủ nhân của điệu xòe Thái và những bộ váy áo cóm duyên dáng vùng Tây Bắc.",
    detail:
      "Người Thái sinh sống nhiều ở Sơn La, Điện Biên, Lai Châu. Nghệ thuật xòe Thái đã được UNESCO ghi danh, cùng với trang phục áo cóm, khăn piêu và ẩm thực đặc sắc.",
    culture: ["Xòe Thái", "Áo cóm", "Khăn piêu", "Nhà sàn"],
  },
  {
    slug: "muong",
    name: "Mường",
    region: "bac",
    regions: ["bac", "trung"],
    population: 1452095,
    languageFamily: "Việt – Mường",
    image: IMG.tay,
    blurb: "Gìn giữ sử thi Đẻ đất đẻ nước và nghệ thuật cồng chiêng vùng Hòa Bình.",
    detail:
      "Người Mường có quan hệ gần gũi với người Kinh, cư trú chủ yếu ở Hòa Bình, Thanh Hóa. Văn hóa cồng chiêng, mo Mường và sử thi là những di sản quý báu.",
    culture: ["Cồng chiêng", "Mo Mường", "Sử thi", "Nhà sàn"],
  },
  {
    slug: "khmer",
    name: "Khơ-me",
    altNames: "Khmer",
    region: "nam",
    regions: ["nam"],
    population: 1319652,
    languageFamily: "Môn – Khơ-me",
    image: IMG.khmer,
    blurb: "Cộng đồng vùng đồng bằng sông Cửu Long với lễ hội Ok Om Bok rực rỡ.",
    detail:
      "Người Khơ-me cư trú tập trung ở Sóc Trăng, Trà Vinh, An Giang. Phật giáo Nam tông chi phối đời sống, với những ngôi chùa vàng lộng lẫy và các lễ hội Chôl Chnăm Thmây, Ok Om Bok.",
    culture: ["Chùa Khmer", "Lễ Ok Om Bok", "Đua ghe ngo", "Nhạc ngũ âm"],
  },
  {
    slug: "hoa",
    name: "Hoa",
    region: "nam",
    regions: ["bac", "trung", "nam"],
    population: 749466,
    languageFamily: "Hán",
    image: IMG.kinh,
    blurb: "Cộng đồng người Hoa gắn với thương mại, ẩm thực và các hội quán cổ kính.",
    detail:
      "Người Hoa sinh sống nhiều ở các đô thị lớn, đặc biệt là Chợ Lớn (TP.HCM). Họ nổi tiếng với văn hóa thương mại, ẩm thực phong phú và các lễ hội truyền thống.",
    culture: ["Hội quán", "Múa lân sư rồng", "Ẩm thực", "Tết Nguyên Tiêu"],
  },
  {
    slug: "nung",
    name: "Nùng",
    region: "bac",
    population: 1083298,
    languageFamily: "Tày – Thái",
    image: IMG.tay,
    blurb: "Nổi tiếng với nghề rèn, dệt và làn điệu Sli giao duyên.",
    detail:
      "Người Nùng cư trú ở Lạng Sơn, Cao Bằng, Bắc Giang. Họ giỏi nghề thủ công như rèn, đúc, dệt vải chàm và giữ gìn hát Sli, hát Lượn.",
    culture: ["Hát Sli", "Nghề rèn", "Vải chàm", "Lễ hội Slức Slương"],
  },
  {
    slug: "hmong",
    name: "H'Mông",
    altNames: "Mông",
    region: "bac",
    population: 1393547,
    languageFamily: "H'Mông – Dao",
    image: IMG.hmong,
    blurb: "Cư dân vùng núi cao với trang phục thổ cẩm rực rỡ và tiếng khèn réo rắt.",
    detail:
      "Người H'Mông sống ở những vùng núi cao như Hà Giang, Lào Cai, Sơn La. Nghệ thuật vẽ sáp ong, dệt lanh, thổi khèn và chợ tình là những nét văn hóa đặc trưng.",
    culture: ["Khèn Mông", "Vẽ sáp ong", "Chợ tình", "Dệt lanh"],
  },
  {
    slug: "dao",
    name: "Dao",
    region: "bac",
    population: 891151,
    languageFamily: "H'Mông – Dao",
    image: IMG.dao,
    blurb: "Nổi bật với trang phục đỏ thêu tinh xảo và lễ cấp sắc truyền thống.",
    detail:
      "Người Dao cư trú rải rác ở nhiều tỉnh miền núi phía Bắc. Trang phục thêu chỉ màu, tục cấp sắc, thuốc tắm lá và chữ Nôm Dao là những di sản đáng quý.",
    culture: ["Lễ cấp sắc", "Thêu thổ cẩm", "Thuốc tắm lá Dao", "Chữ Nôm Dao"],
  },
  {
    slug: "gia-rai",
    name: "Gia Rai",
    region: "trung",
    population: 513930,
    languageFamily: "Nam Đảo",
    image: IMG.ede,
    blurb: "Chủ nhân của không gian văn hóa cồng chiêng Tây Nguyên hùng vĩ.",
    detail:
      "Người Gia Rai sống ở Gia Lai, Kon Tum. Nhà rông, tượng nhà mồ, cồng chiêng và các sử thi (khan) là linh hồn văn hóa của cộng đồng.",
    culture: ["Cồng chiêng", "Nhà rông", "Tượng nhà mồ", "Sử thi khan"],
  },
  {
    slug: "e-de",
    name: "Ê Đê",
    region: "trung",
    population: 398671,
    languageFamily: "Nam Đảo",
    image: IMG.ede,
    blurb: "Xã hội mẫu hệ với nhà dài truyền thống và sử thi Đăm Săn.",
    detail:
      "Người Ê Đê cư trú chủ yếu ở Đắk Lắk. Chế độ mẫu hệ, nhà dài, cồng chiêng và sử thi Đăm Săn là những đặc trưng văn hóa nổi bật.",
    culture: ["Nhà dài", "Chế độ mẫu hệ", "Cồng chiêng", "Sử thi Đăm Săn"],
  },
  {
    slug: "ba-na",
    name: "Ba Na",
    region: "trung",
    population: 286910,
    languageFamily: "Môn – Khơ-me",
    image: IMG.ede,
    blurb: "Nổi tiếng với nhà rông cao vút và nghệ thuật cồng chiêng đặc sắc.",
    detail:
      "Người Ba Na sống ở Gia Lai, Kon Tum, Bình Định. Nhà rông là biểu tượng của làng, cùng với cồng chiêng, đan lát và lễ hội đâm trâu.",
    culture: ["Nhà rông", "Cồng chiêng", "Đan lát", "Lễ hội mừng lúa mới"],
  },
  {
    slug: "xo-dang",
    name: "Xơ Đăng",
    region: "trung",
    population: 212277,
    languageFamily: "Môn – Khơ-me",
    image: IMG.ede,
    blurb: "Cư dân Tây Nguyên với nghề làm ruộng bậc thang và đúc đồng.",
    detail:
      "Người Xơ Đăng cư trú ở Kon Tum. Họ giỏi làm ruộng nước, đan lát và giữ gìn các nghi lễ nông nghiệp cùng cồng chiêng.",
    culture: ["Cồng chiêng", "Nhà rông", "Ruộng bậc thang", "Lễ máng nước"],
  },
  {
    slug: "san-chay",
    name: "Sán Chay",
    altNames: "Cao Lan – Sán Chỉ",
    region: "bac",
    population: 201398,
    languageFamily: "Tày – Thái",
    image: IMG.tay,
    blurb: "Gìn giữ điệu hát Sình ca giao duyên đằm thắm.",
    detail:
      "Người Sán Chay cư trú ở Tuyên Quang, Thái Nguyên, Bắc Giang. Hát Sình ca, múa trống và các nghi lễ nông nghiệp là nét văn hóa tiêu biểu.",
    culture: ["Hát Sình ca", "Múa trống", "Nhà sàn", "Lễ cầu mùa"],
  },
  {
    slug: "co-ho",
    name: "Cơ Ho",
    region: "trung",
    population: 200800,
    languageFamily: "Môn – Khơ-me",
    image: IMG.ede,
    blurb: "Cư dân cao nguyên Lâm Đồng với nghề dệt thổ cẩm và cồng chiêng.",
    detail:
      "Người Cơ Ho sống chủ yếu ở Lâm Đồng. Họ nổi tiếng với nghề dệt thổ cẩm, cồng chiêng và các lễ hội gắn với chu kỳ canh tác nương rẫy.",
    culture: ["Dệt thổ cẩm", "Cồng chiêng", "Lễ mừng lúa mới", "Nhà sàn dài"],
  },
  {
    slug: "cham",
    name: "Chăm",
    altNames: "Chàm",
    region: "trung",
    regions: ["trung", "nam"],
    population: 178948,
    languageFamily: "Nam Đảo",
    image: IMG.cham,
    blurb: "Hậu duệ vương quốc Chăm Pa với đền tháp và nghề gốm Bàu Trúc.",
    detail:
      "Người Chăm cư trú ở Ninh Thuận, Bình Thuận, An Giang. Kiến trúc đền tháp, lễ hội Kate, nghề gốm Bàu Trúc và dệt Mỹ Nghiệp là những di sản độc đáo.",
    culture: ["Tháp Chăm", "Lễ hội Kate", "Gốm Bàu Trúc", "Dệt Mỹ Nghiệp"],
  },
  {
    slug: "san-diu",
    name: "Sán Dìu",
    region: "bac",
    population: 183004,
    languageFamily: "Hán",
    image: IMG.tay,
    blurb: "Cộng đồng trung du với làn điệu Soọng cô mượt mà.",
    detail:
      "Người Sán Dìu cư trú ở Vĩnh Phúc, Thái Nguyên, Quảng Ninh. Hát Soọng cô, ẩm thực và các nghi lễ vòng đời là nét đặc trưng.",
    culture: ["Hát Soọng cô", "Xe quệt", "Lễ cấp sắc", "Ẩm thực trung du"],
  },
  {
    slug: "hre",
    name: "Hrê",
    region: "trung",
    population: 149460,
    languageFamily: "Môn – Khơ-me",
    image: IMG.ede,
    blurb: "Cư dân miền tây Quảng Ngãi với nghề trồng lúa nước và đàn Chinh Kră.",
    detail:
      "Người Hrê sinh sống ở Quảng Ngãi, Bình Định. Họ giỏi trồng lúa nước, dệt thổ cẩm và có kho tàng dân ca, nhạc cụ phong phú.",
    culture: ["Chiêng ba", "Dệt thổ cẩm", "Ruộng bậc thang", "Dân ca Ka choi"],
  },
  {
    slug: "mnong",
    name: "Mnông",
    region: "trung",
    population: 127334,
    languageFamily: "Môn – Khơ-me",
    image: IMG.ede,
    blurb: "Nổi tiếng với nghề thuần dưỡng voi và sử thi Ot Ndrong.",
    detail:
      "Người Mnông cư trú ở Đắk Lắk, Đắk Nông. Nghề săn bắt và thuần dưỡng voi, sử thi Ot Ndrong và cồng chiêng là những nét văn hóa đặc sắc.",
    culture: ["Thuần dưỡng voi", "Sử thi Ot Ndrong", "Cồng chiêng", "Dệt thổ cẩm"],
  },
  {
    slug: "ra-glai",
    name: "Ra Glai",
    region: "trung",
    population: 146613,
    languageFamily: "Nam Đảo",
    image: IMG.ede,
    blurb: "Cư dân núi rừng Nam Trung Bộ với đàn đá và mã la độc đáo.",
    detail:
      "Người Ra Glai sống ở Ninh Thuận, Khánh Hòa. Đàn đá, mã la, sử thi và các lễ nghi nông nghiệp là những di sản văn hóa quý.",
    culture: ["Đàn đá", "Mã la", "Lễ bỏ mả", "Sử thi"],
  },
  {
    slug: "xtieng",
    name: "Xtiêng",
    region: "nam",
    population: 100752,
    languageFamily: "Môn – Khơ-me",
    image: IMG.ede,
    blurb: "Cư dân miền Đông Nam Bộ với nghề nương rẫy và cồng chiêng.",
    detail:
      "Người Xtiêng cư trú ở Bình Phước. Họ canh tác nương rẫy, đan lát và gìn giữ nghệ thuật cồng chiêng cùng các lễ hội truyền thống.",
    culture: ["Cồng chiêng", "Đan lát", "Nhà dài", "Lễ hội cầu mưa"],
  },
  {
    slug: "bru-van-kieu",
    name: "Bru - Vân Kiều",
    region: "trung",
    population: 94598,
    languageFamily: "Môn – Khơ-me",
    image: IMG.ede,
    blurb: "Cư dân dãy Trường Sơn với kho tàng dân ca và nhạc cụ phong phú.",
    detail:
      "Người Bru - Vân Kiều cư trú ở Quảng Bình, Quảng Trị. Dân ca, nhạc cụ như khèn bè, đàn ta lư và các lễ hội gắn với núi rừng là nét đặc trưng.",
    culture: ["Đàn ta lư", "Khèn bè", "Lễ mừng lúa mới", "Nhà sàn"],
  },
  {
    slug: "tho",
    name: "Thổ",
    region: "trung",
    population: 91430,
    languageFamily: "Việt – Mường",
    image: IMG.tay,
    blurb: "Cộng đồng miền tây Nghệ An với nghề trồng gai dệt vải.",
    detail:
      "Người Thổ cư trú ở Nghệ An, Thanh Hóa. Họ trồng cây gai để dệt vải, làm nương rẫy và giữ gìn dân ca, dân vũ truyền thống.",
    culture: ["Dệt vải gai", "Dân ca", "Nương rẫy", "Nhà sàn"],
  },
  {
    slug: "giay",
    name: "Giáy",
    region: "bac",
    population: 67858,
    languageFamily: "Tày – Thái",
    image: IMG.thai,
    blurb: "Cư dân vùng cao với kho tàng truyện cổ và dân ca phong phú.",
    detail:
      "Người Giáy sống ở Lào Cai, Hà Giang, Lai Châu. Họ có kho tàng văn học dân gian phong phú cùng các nghi lễ nông nghiệp đặc sắc.",
    culture: ["Dân ca vươn", "Lễ Roóng Poọc", "Nhà đất", "Truyện cổ"],
  },
  {
    slug: "co-tu",
    name: "Cơ Tu",
    region: "trung",
    population: 74173,
    languageFamily: "Môn – Khơ-me",
    image: IMG.ede,
    blurb: "Cư dân Trường Sơn với điệu múa Tung tung da dá và nhà gươl.",
    detail:
      "Người Cơ Tu cư trú ở Quảng Nam, Thừa Thiên Huế. Nhà gươl, điệu múa Tung tung da dá, nghề dệt và điêu khắc gỗ là những di sản đặc sắc.",
    culture: ["Nhà gươl", "Múa Tung tung da dá", "Dệt thổ cẩm", "Điêu khắc gỗ"],
  },
  {
    slug: "gie-trieng",
    name: "Gié Triêng",
    region: "trung",
    population: 63322,
    languageFamily: "Môn – Khơ-me",
    image: IMG.ede,
    blurb: "Cư dân bắc Tây Nguyên với nghề đan lát và cồng chiêng.",
    detail:
      "Người Gié Triêng sống ở Kon Tum, Quảng Nam. Họ nổi tiếng với nghề đan lát tinh xảo, nhà rông và các lễ hội cồng chiêng.",
    culture: ["Đan lát", "Nhà rông", "Cồng chiêng", "Lễ ăn trâu"],
  },
  {
    slug: "ma",
    name: "Mạ",
    region: "trung",
    population: 50322,
    languageFamily: "Môn – Khơ-me",
    image: IMG.ede,
    blurb: "Cư dân nam Tây Nguyên với nghề dệt thổ cẩm truyền thống.",
    detail:
      "Người Mạ cư trú ở Lâm Đồng, Đắk Nông. Dệt thổ cẩm, cồng chiêng và các lễ hội nông nghiệp là những nét văn hóa tiêu biểu.",
    culture: ["Dệt thổ cẩm", "Cồng chiêng", "Nhà dài", "Lễ hội đâm trâu"],
  },
  {
    slug: "kho-mu",
    name: "Khơ Mú",
    region: "bac",
    regions: ["bac", "trung"],
    population: 90612,
    languageFamily: "Môn – Khơ-me",
    image: IMG.thai,
    blurb: "Cư dân Tây Bắc với điệu múa Vêr Guông và lễ cầu mưa.",
    detail:
      "Người Khơ Mú sống ở Nghệ An, Sơn La, Điện Biên. Họ làm nương rẫy, có các điệu múa dân gian và nghi lễ nông nghiệp độc đáo.",
    culture: ["Múa Vêr Guông", "Lễ cầu mưa", "Nương rẫy", "Nhạc cụ tre nứa"],
  },
  {
    slug: "co",
    name: "Co",
    region: "trung",
    population: 40442,
    languageFamily: "Môn – Khơ-me",
    image: IMG.ede,
    blurb: "Cư dân miền núi Quảng Nam - Quảng Ngãi với lễ hội đâm trâu.",
    detail:
      "Người Co cư trú ở Quảng Ngãi, Quảng Nam. Họ trồng quế nổi tiếng, có nghệ thuật cồng chiêng và các lễ hội truyền thống đặc sắc.",
    culture: ["Cây quế", "Cồng chiêng", "Lễ ăn trâu", "Nhà sàn dài"],
  },
  {
    slug: "ta-oi",
    name: "Tà Ôi",
    region: "trung",
    population: 52356,
    languageFamily: "Môn – Khơ-me",
    image: IMG.ede,
    blurb: "Cư dân Trường Sơn với nghề dệt Zèng độc đáo.",
    detail:
      "Người Tà Ôi sống ở Thừa Thiên Huế, Quảng Trị. Nghề dệt Zèng (đính cườm) là di sản văn hóa phi vật thể quốc gia độc đáo của cộng đồng.",
    culture: ["Dệt Zèng", "Nhà dài", "Cồng chiêng", "Lễ Aza"],
  },
  {
    slug: "cho-ro",
    name: "Chơ Ro",
    region: "nam",
    population: 29520,
    languageFamily: "Môn – Khơ-me",
    image: IMG.ede,
    blurb: "Cư dân miền Đông Nam Bộ với lễ hội cúng thần rừng, thần lúa.",
    detail:
      "Người Chơ Ro cư trú ở Đồng Nai, Bà Rịa - Vũng Tàu. Lễ cúng thần rừng (Ốp Yang Va), thần lúa và nhạc cụ dân tộc là nét văn hóa tiêu biểu.",
    culture: ["Lễ cúng thần lúa", "Cồng chiêng", "Nhà sàn", "Đàn tre"],
  },
  {
    slug: "khang",
    name: "Kháng",
    region: "bac",
    population: 16180,
    languageFamily: "Môn – Khơ-me",
    image: IMG.thai,
    blurb: "Cư dân Tây Bắc với nghề đan thuyền độc mộc và lễ mừng cơm mới.",
    detail:
      "Người Kháng sống ở Sơn La, Điện Biên, Lai Châu. Họ giỏi đan lát, làm thuyền độc mộc và giữ gìn các nghi lễ nông nghiệp.",
    culture: ["Thuyền độc mộc", "Lễ cơm mới", "Nương rẫy", "Nhạc cụ tre"],
  },
  {
    slug: "xinh-mun",
    name: "Xinh Mun",
    region: "bac",
    population: 29503,
    languageFamily: "Môn – Khơ-me",
    image: IMG.thai,
    blurb: "Cư dân vùng biên giới Tây Bắc với tục nhuộm răng đen.",
    detail:
      "Người Xinh Mun cư trú ở Sơn La, Điện Biên. Họ làm nương rẫy, ở nhà sàn và giữ gìn nhiều phong tục tập quán độc đáo.",
    culture: ["Nhà sàn", "Nương rẫy", "Lễ Mạng Ma", "Rượu cần"],
  },
  {
    slug: "ha-nhi",
    name: "Hà Nhì",
    region: "bac",
    population: 25539,
    languageFamily: "Tạng – Miến",
    image: IMG.hmong,
    blurb: "Cư dân vùng cao biên giới với nhà trình tường và lễ Khô Già Già.",
    detail:
      "Người Hà Nhì sống ở Lào Cai, Lai Châu, Điện Biên. Nhà trình tường đắp đất, lễ hội Khô Già Già và ruộng bậc thang là những nét đặc trưng.",
    culture: ["Nhà trình tường", "Lễ Khô Già Già", "Ruộng bậc thang", "Trang phục thêu"],
  },
  {
    slug: "chu-ru",
    name: "Chu Ru",
    region: "trung",
    population: 23242,
    languageFamily: "Nam Đảo",
    image: IMG.ede,
    blurb: "Cư dân cao nguyên Lâm Đồng với nghề làm gốm và nhẫn bạc.",
    detail:
      "Người Chu Ru cư trú ở Lâm Đồng. Họ nổi tiếng với nghề làm gốm Krăng Gọ, chế tác nhẫn bạc và các lễ hội nông nghiệp.",
    culture: ["Gốm Krăng Gọ", "Nhẫn bạc", "Lễ cúng thần Bơ Mung", "Dệt thổ cẩm"],
  },
  {
    slug: "lao",
    name: "Lào",
    region: "bac",
    population: 17532,
    languageFamily: "Tày – Thái",
    image: IMG.thai,
    blurb: "Cư dân Tây Bắc với nghề dệt và lễ hội té nước Bun Vốc Nặm.",
    detail:
      "Người Lào sống ở Điện Biên, Lai Châu, Sơn La. Nghề dệt thổ cẩm, chữ viết riêng và lễ hội té nước là những nét văn hóa đặc sắc.",
    culture: ["Dệt thổ cẩm", "Lễ té nước", "Nhà sàn", "Múa Lăm vông"],
  },
  {
    slug: "la-chi",
    name: "La Chí",
    region: "bac",
    population: 15126,
    languageFamily: "Kađai",
    image: IMG.hmong,
    blurb: "Cư dân Hà Giang với ruộng bậc thang và lễ hội Khu Cù Tê.",
    detail:
      "Người La Chí cư trú ở Hà Giang, Lào Cai. Họ khai khẩn ruộng bậc thang, dệt vải và tổ chức lễ hội Khu Cù Tê truyền thống.",
    culture: ["Ruộng bậc thang", "Lễ Khu Cù Tê", "Dệt vải", "Trống chiêng"],
  },
  {
    slug: "phu-la",
    name: "Phù Lá",
    region: "bac",
    population: 12471,
    languageFamily: "Tạng – Miến",
    image: IMG.hmong,
    blurb: "Cư dân vùng cao với trang phục thêu hoa văn tinh xảo.",
    detail:
      "Người Phù Lá sống ở Lào Cai, Yên Bái, Hà Giang. Trang phục thêu rực rỡ, nghề nông và các nghi lễ truyền thống là nét đặc trưng.",
    culture: ["Trang phục thêu", "Nương rẫy", "Nhà đất", "Dân ca"],
  },
  {
    slug: "la-hu",
    name: "La Hủ",
    region: "bac",
    population: 12113,
    languageFamily: "Tạng – Miến",
    image: IMG.hmong,
    blurb: "Cư dân vùng cao Mường Tè với đời sống gắn liền núi rừng.",
    detail:
      "Người La Hủ cư trú ở Lai Châu. Họ sống dựa vào nương rẫy, săn bắt hái lượm và giữ gìn nhiều tập quán truyền thống độc đáo.",
    culture: ["Nương rẫy", "Đan lát", "Nhạc cụ tre", "Lễ cơm mới"],
  },
  {
    slug: "la-ha",
    name: "La Ha",
    region: "bac",
    population: 10157,
    languageFamily: "Kađai",
    image: IMG.thai,
    blurb: "Cư dân Tây Bắc với lễ hội Pang A cầu mùa đặc sắc.",
    detail:
      "Người La Ha sống ở Sơn La, Lào Cai. Lễ hội Pang A, các nghi lễ nông nghiệp và đời sống cộng đồng gắn bó là nét văn hóa tiêu biểu.",
    culture: ["Lễ Pang A", "Nương rẫy", "Nhà sàn", "Dân ca"],
  },
  {
    slug: "pa-then",
    name: "Pà Thẻn",
    region: "bac",
    population: 8248,
    languageFamily: "H'Mông – Dao",
    image: IMG.dao,
    blurb: "Nổi tiếng với lễ hội nhảy lửa huyền bí vùng Hà Giang.",
    detail:
      "Người Pà Thẻn cư trú ở Hà Giang, Tuyên Quang. Lễ hội nhảy lửa, trang phục đỏ rực và các nghi lễ tâm linh là những nét văn hóa độc đáo.",
    culture: ["Lễ nhảy lửa", "Trang phục đỏ", "Dệt vải", "Kéo chày"],
  },
  {
    slug: "lu",
    name: "Lự",
    region: "bac",
    population: 6757,
    languageFamily: "Tày – Thái",
    image: IMG.thai,
    blurb: "Cư dân Lai Châu với tục nhuộm răng đen và dệt vải truyền thống.",
    detail:
      "Người Lự sống ở Lai Châu. Họ trồng lúa nước, dệt vải, nhuộm răng đen và giữ gìn các phong tục tập quán cổ truyền.",
    culture: ["Dệt vải", "Nhuộm răng đen", "Nhà sàn", "Lúa nước"],
  },
  {
    slug: "ngai",
    name: "Ngái",
    region: "bac",
    regions: ["bac", "trung", "nam"],
    population: 1649,
    languageFamily: "Hán",
    image: IMG.kinh,
    blurb: "Cộng đồng gắn với nghề chài lưới và làm ruộng vùng ven biển.",
    detail:
      "Người Ngái cư trú rải rác ở nhiều tỉnh. Họ làm nông, chài lưới ven biển và giữ gìn các phong tục, tín ngưỡng truyền thống.",
    culture: ["Chài lưới", "Làm ruộng", "Hát Sán cố", "Tín ngưỡng dân gian"],
  },
  {
    slug: "chut",
    name: "Chứt",
    region: "trung",
    population: 7513,
    languageFamily: "Việt – Mường",
    image: IMG.ede,
    blurb: "Cư dân núi rừng Quảng Bình gắn với đời sống hang đá xưa.",
    detail:
      "Người Chứt sinh sống ở Quảng Bình, Hà Tĩnh. Trước đây họ sống trong hang đá, nay định canh định cư, giữ gìn nhiều tập quán cổ.",
    culture: ["Nương rẫy", "Săn bắt hái lượm", "Lễ cơm mới", "Nhạc cụ tre"],
  },
  {
    slug: "lo-lo",
    name: "Lô Lô",
    region: "bac",
    population: 4827,
    languageFamily: "Tạng – Miến",
    image: IMG.hmong,
    blurb: "Cư dân cực Bắc với trống đồng và trang phục ghép vải rực rỡ.",
    detail:
      "Người Lô Lô cư trú ở Hà Giang, Cao Bằng. Trống đồng, trang phục ghép vải nhiều màu và các nghi lễ truyền thống là nét văn hóa đặc sắc.",
    culture: ["Trống đồng", "Trang phục ghép vải", "Lễ cầu mưa", "Nhà trình tường"],
  },
  {
    slug: "mang",
    name: "Mảng",
    region: "bac",
    population: 4650,
    languageFamily: "Môn – Khơ-me",
    image: IMG.thai,
    blurb: "Cư dân vùng cao Lai Châu với tục xăm cằm truyền thống.",
    detail:
      "Người Mảng sống ở Lai Châu. Họ làm nương rẫy, có tục xăm cằm, xăm mặt và giữ gìn nhiều nghi lễ nông nghiệp cổ truyền.",
    culture: ["Nương rẫy", "Tục xăm cằm", "Đan lát", "Lễ cầu mùa"],
  },
  {
    slug: "co-lao",
    name: "Cơ Lao",
    region: "bac",
    population: 4003,
    languageFamily: "Kađai",
    image: IMG.hmong,
    blurb: "Cư dân cao nguyên đá Đồng Văn với nghề canh tác hốc đá.",
    detail:
      "Người Cơ Lao cư trú ở Hà Giang. Họ canh tác trên cao nguyên đá, trồng ngô trong hốc đá và giữ gìn các phong tục truyền thống.",
    culture: ["Canh tác hốc đá", "Nhà trình tường", "Dệt vải", "Lễ cúng thần"],
  },
  {
    slug: "bo-y",
    name: "Bố Y",
    region: "bac",
    population: 3232,
    languageFamily: "Tày – Thái",
    image: IMG.hmong,
    blurb: "Cư dân vùng biên với trang phục và trang sức bạc tinh tế.",
    detail:
      "Người Bố Y sống ở Lào Cai, Hà Giang. Trang phục nhiều màu, trang sức bạc và các nghi lễ vòng đời là nét văn hóa tiêu biểu.",
    culture: ["Trang sức bạc", "Trang phục thêu", "Nương rẫy", "Dân ca"],
  },
  {
    slug: "cong",
    name: "Cống",
    region: "bac",
    population: 2729,
    languageFamily: "Tạng – Miến",
    image: IMG.hmong,
    blurb: "Cư dân ven sông Đà với lễ hội Mền Loóng Phạt Ái.",
    detail:
      "Người Cống cư trú ở Lai Châu, Điện Biên. Họ sống ven sông suối, làm nương rẫy và tổ chức lễ hội cầu mùa đặc sắc.",
    culture: ["Lễ Mền Loóng Phạt Ái", "Nương rẫy", "Nhà sàn", "Dệt vải"],
  },
  {
    slug: "si-la",
    name: "Si La",
    region: "bac",
    population: 909,
    languageFamily: "Tạng – Miến",
    image: IMG.hmong,
    blurb: "Một trong những dân tộc rất ít người vùng biên giới Tây Bắc.",
    detail:
      "Người Si La cư trú ở Lai Châu, Điện Biên. Họ giữ gìn trang phục truyền thống với hàng cúc bạc và nhiều phong tục độc đáo.",
    culture: ["Trang phục cúc bạc", "Nương rẫy", "Lễ cơm mới", "Dân ca"],
  },
  {
    slug: "pu-peo",
    name: "Pu Péo",
    region: "bac",
    population: 903,
    languageFamily: "Kađai",
    image: IMG.hmong,
    blurb: "Dân tộc rất ít người nơi địa đầu Tổ quốc Hà Giang.",
    detail:
      "Người Pu Péo cư trú ở Hà Giang. Họ giữ gìn tục thờ thần rừng, hát đối đáp và trang phục truyền thống đặc sắc.",
    culture: ["Thờ thần rừng", "Hát đối đáp", "Trang phục thêu", "Canh tác hốc đá"],
  },
  {
    slug: "ro-mam",
    name: "Rơ Măm",
    region: "trung",
    population: 639,
    languageFamily: "Môn – Khơ-me",
    image: IMG.ede,
    blurb: "Dân tộc rất ít người ở làng Le, Kon Tum.",
    detail:
      "Người Rơ Măm sinh sống ở Kon Tum. Cộng đồng nhỏ này gìn giữ nghề dệt, cồng chiêng và các lễ hội truyền thống của mình.",
    culture: ["Dệt thổ cẩm", "Cồng chiêng", "Lễ mừng lúa mới", "Nhà rông"],
  },
  {
    slug: "brau",
    name: "Brâu",
    region: "trung",
    population: 525,
    languageFamily: "Môn – Khơ-me",
    image: IMG.ede,
    blurb: "Một trong những dân tộc ít người nhất, cư trú ở Kon Tum.",
    detail:
      "Người Brâu sống ở làng Đắk Mế, Kon Tum. Họ giữ gìn nghệ thuật chiêng Tha, đàn Chinh Kram và các nghi lễ truyền thống.",
    culture: ["Chiêng Tha", "Đàn Chinh Kram", "Nhà rông", "Lễ mừng lúa mới"],
  },
  {
    slug: "o-du",
    name: "Ơ Đu",
    region: "trung",
    population: 428,
    languageFamily: "Môn – Khơ-me",
    image: IMG.thai,
    blurb: "Dân tộc ít người nhất Việt Nam, cư trú ở Nghệ An.",
    detail:
      "Người Ơ Đu là dân tộc có dân số ít nhất Việt Nam, sinh sống ở Nghệ An. Họ đang nỗ lực phục hồi tiếng nói, trang phục và các phong tục truyền thống.",
    culture: ["Lễ mừng tiếng sấm", "Nương rẫy", "Nhà sàn", "Phục hồi tiếng nói"],
  },
]

export function getEthnic(slug: string) {
  return ethnicGroups.find((e) => e.slug === slug)
}

export function regionsForEthnic(ethnic: Pick<Ethnic, "region" | "regions">) {
  return ethnic.regions?.length ? ethnic.regions : [ethnic.region]
}

export function regionLabel(id: RegionId) {
  return regions.find((r) => r.id === id)?.label ?? id
}

export interface Product {
  id: string
  name: string
  price: number
  image: string
  ethnicSlug: string
  category: string
  description?: string
  origin?: string
  craft?: string
  culturalValue?: string
  forSale?: boolean
  inStock?: boolean
}


export const products: Product[] = [
  { id: "p-hmong-1", name: "Khăn thổ cẩm H'Mông thêu tay", price: 350000, image: IMG.hmong, ethnicSlug: "hmong", category: "Thổ cẩm", description: "Khăn được dệt từ sợi lanh, nhuộm chàm và thêu tay các hoa văn hình học đặc trưng của người H'Mông. Mỗi họa tiết gắn với kýức về núi rừng và đời sống gia đình.", forSale: true, inStock: true },
  { id: "p-hmong-2", name: "Khèn Mông truyền thống", price: 1250000, image: IMG.hmong, ethnicSlug: "hmong", category: "Nhạc cụ", description: "Khèn Mông là nhạc cụ hơi làm từ nhiều ống nứa ghép với bầu gỗ. Âm thanh của khèn xuất hiện trong hội mùa xuân, chợ tình và những điệu múa giao duyên vùng cao.", forSale: true, inStock: true },
  { id: "p-dao-1", name: "Túi thêu chỉ màu người Dao", price: 280000, image: IMG.dao, ethnicSlug: "dao", category: "Thổ cẩm", description: "Túi vải được may và thêu thủ công bằng chỉ màu, nổi bật với các mô-típ cây cỏ, hình học và đường viền của người Dao." },
  { id: "p-dao-2", name: "Gói lá thuốc tắm người Dao đỏ", price: 150000, image: IMG.dao, ethnicSlug: "dao", category: "Đặc sản", description: "Bài lá tắm là tri thức dân gian được người Dao đỏ truyền qua nhiều thế hệ, gắn với đời sống vùng núi và cách chăm sóc cơ thể truyền thống." },
  { id: "p-thai-1", name: "Khăn piêu thêu tay Thái", price: 320000, image: IMG.thai, ethnicSlug: "thai", category: "Thổ cẩm", description: "Khăn piêu được thêu trên nền vải chàm với những dải màu và hoa văn cân đối, là một phần quan trọng trong trang phục và nghi lễ của phụ nữ Thái.", forSale: true, inStock: true },
  { id: "p-thai-2", name: "Váy áo cóm Thái", price: 890000, image: IMG.thai, ethnicSlug: "thai", category: "Trang phục", description: "Bộ váy áo cóm gồm áo ôm thân, váy đen dài và khăn piêu, tạo nên diện mạo duyên dáng đặc trưng của phụ nữ Thái Tây Bắc.", forSale: true, inStock: true },
  { id: "p-tay-1", name: "Đàn tính dân tộc Tày", price: 750000, image: IMG.tay, ethnicSlug: "tay", category: "Nhạc cụ", description: "Đàn tính có thân bầu gỗ, cần dài và hai hoặc ba dây. Nhạc cụ này đi cùng hát Then, kể những câu chuyện tâm linh và ước vọng bình an của người Tày.", forSale: true, inStock: true },
  { id: "p-muong-1", name: "Cồng chiêng Mường chế tác đồng", price: 850000, image: IMG.tay, ethnicSlug: "muong", category: "Nhạc cụ", description: "Nhạc cụ cồng chiêng gắn liền với đời sống tâm linh, nghi lễ và các ngày hội lớn của người Mường.", forSale: true, inStock: true },
  { id: "p-nung-1", name: "Vải chàm dệt tay người Nùng", price: 260000, image: IMG.tay, ethnicSlug: "nung", category: "Thổ cẩm", description: "Vải dệt từ sợi bông tự nhiên, nhuộm chàm thủ công nhiều lần tạo nên sắc xanh chàm đặc trưng của đồng bào Nùng.", forSale: true, inStock: true },
  { id: "p-cham-1", name: "Bình gốm Bàu Trúc thủ công", price: 450000, image: IMG.cham, ethnicSlug: "cham", category: "Gốm sứ", description: "Gốm Bàu Trúc được tạo hình bằng tay và nung theo kỹ thuật truyền thống, với bề mặt mộc và hoa văn tự nhiên làm nên nét riêng của gốm Chăm." },
  { id: "p-cham-2", name: "Khăn dệt Mỹ Nghiệp Chăm", price: 390000, image: IMG.cham, ethnicSlug: "cham", category: "Thổ cẩm", description: "Vải dệt Mỹ Nghiệp được làm trên khung dệt thủ công với hoa văn hình học và màu sắc trang nhã, là một di sản quan trọng trong đời sống văn hóa Chăm." },
  { id: "p-ede-1", name: "Vòng tay đồng Ê Đê", price: 210000, image: IMG.ede, ethnicSlug: "e-de", category: "Trang sức", description: "Trang sức đồng gắn với trang phục và các nghi lễ của người Ê Đê, thể hiện vẻ đẹp mộc mạc và sự khéo léo của nghề chế tác kim loại." },
  { id: "p-ede-2", name: "Chiêng đồng Tây Nguyên mini", price: 1450000, image: IMG.ede, ethnicSlug: "gia-rai", category: "Nhạc cụ", description: "Cồng chiêng giữ vai trò trung tâm trong lễ hội, nghi lễ vòng đời và sinh hoạt cộng đồng Tây Nguyên, kết nối con người với buôn làng và thế giới tâm linh." },
  { id: "p-khmer-1", name: "Khăn rằn Khmer Nam Bộ", price: 180000, image: IMG.khmer, ethnicSlug: "khmer", category: "Thổ cẩm", description: "Khăn rằn là vật dụng quen thuộc của cư dân Nam Bộ, với những ô caro giản dị gắn với ký ức sông nước và đời sống Khmer.", forSale: true, inStock: true },
  { id: "p-kinh-1", name: "Áo dài lụa truyền thống", price: 1200000, image: IMG.kinh, ethnicSlug: "kinh", category: "Trang phục", description: "Áo dài tôn lên dáng người bằng đường cắt mềm mại và chất liệu lụa nhẹ, trở thành biểu tượng tiêu biểu của văn hóa Việt trong đời sống và lễ nghi." },
  { id: "p-kinh-2", name: "Nón lá Việt Nam", price: 120000, image: IMG.kinh, ethnicSlug: "kinh", category: "Thủ công", description: "Nón lá được chằm từ lá và nan tre, vừa che nắng mưa vừa trở thành hình ảnh quen thuộc trong đời sống người Việt. Nghề làm nón đòi hỏi sự đều tay và kiên nhẫn." },
]

export function productsForEthnic(slug: string) {
  return products.filter((p) => p.ethnicSlug === slug)
}

const productDetails: Record<string, { origin: string; craft: string; culturalValue: string }> = {
  "p-hmong-1": { origin: "Các bản làng H'Mông vùng núi phía Bắc.", craft: "Sợi lanh dệt thủ công, nhuộm chàm và thêu tay hoa văn hình học.", culturalValue: "Hoa văn lưu giữ ký ức về núi rừng, gia đình và quan niệm thẩm mỹ của người H'Mông." },
  "p-hmong-2": { origin: "Không gian lễ hội và sinh hoạt giao duyên của người H'Mông.", craft: "Nhiều ống nứa ghép với bầu gỗ, điều chỉnh âm thanh bằng kỹ thuật thủ công.", culturalValue: "Tiếng khèn gắn với múa khèn, hội xuân, chợ tình và những câu chuyện tình cảm vùng cao." },
  "p-dao-1": { origin: "Các cộng đồng Dao ở vùng núi phía Bắc.", craft: "Vải cotton hoặc vải lanh, cắt may và thêu tay bằng chỉ nhiều màu.", culturalValue: "Hoa văn cây cỏ và hình học thể hiện thế giới quan, ký ức cộng đồng và kỹ năng của người phụ nữ Dao." },
  "p-dao-2": { origin: "Tri thức cây thuốc của người Dao đỏ vùng núi phía Bắc.", craft: "Nhiều loại lá rừng được nhận biết, thu hái và phối hợp theo kinh nghiệm gia truyền.", culturalValue: "Bài lá tắm là một phần của tri thức dân gian và nghi thức chăm sóc sức khỏe trong cộng đồng." },
  "p-thai-1": { origin: "Các bản Thái ở Sơn La, Điện Biên, Lai Châu.", craft: "Nền vải chàm thêu tay các dải màu và hoa văn cân đối.", culturalValue: "Khăn piêu gắn với trang phục, nghi lễ, đời sống hôn nhân và vẻ đẹp của phụ nữ Thái." },
  "p-thai-2": { origin: "Trang phục truyền thống của phụ nữ Thái Tây Bắc.", craft: "Áo cóm may ôm thân, váy đen dài kết hợp cùng khăn piêu.", culturalValue: "Bộ trang phục thể hiện sự duyên dáng, bản sắc gia đình và văn hóa cộng đồng Thái." },
  "p-tay-1": { origin: "Các cộng đồng Tày ở vùng Đông Bắc và Việt Bắc.", craft: "Bầu đàn, cần gỗ và dây đàn được làm thủ công để tạo âm thanh trầm ấm.", culturalValue: "Đàn tính là nhạc cụ đi cùng hát Then, những lời cầu chúc và nghi lễ tâm linh của người Tày." },
  "p-cham-1": { origin: "Làng gốm Bàu Trúc của người Chăm ở Ninh Thuận.", craft: "Đất sét tạo hình bằng tay, trang trí mộc và nung theo kỹ thuật truyền thống.", culturalValue: "Gốm Bàu Trúc phản ánh tri thức địa phương và vai trò của nghề gốm trong đời sống Chăm." },
  "p-cham-2": { origin: "Làng dệt Mỹ Nghiệp của cộng đồng Chăm.", craft: "Dệt trên khung thủ công với hoa văn hình học và màu sắc hài hòa.", culturalValue: "Nghề dệt truyền từ mẹ sang con, góp phần gìn giữ ký ức và bản sắc Chăm." },
  "p-ede-1": { origin: "Các buôn làng Ê Đê ở Đắk Lắk và Tây Nguyên.", craft: "Đồng được tạo hình, mài và hoàn thiện thành vòng đeo tay thủ công.", culturalValue: "Trang sức gắn với trang phục, nghi lễ và vẻ đẹp mộc mạc của người Ê Đê." },
  "p-ede-2": { origin: "Không gian văn hóa cồng chiêng Tây Nguyên.", craft: "Chiêng đồng được đúc, tạo mặt và chỉnh âm bằng kỹ thuật của nghệ nhân.", culturalValue: "Cồng chiêng kết nối buôn làng trong lễ hội, nghi lễ vòng đời và sinh hoạt cộng đồng." },
  "p-khmer-1": { origin: "Các tỉnh Sóc Trăng, Trà Vinh và An Giang.", craft: "Vải dệt caro với cách phối màu bền, tiện dụng trong sinh hoạt hằng ngày.", culturalValue: "Khăn rằn gắn với đời sống sông nước Nam Bộ và hình ảnh người Khmer trong lao động." },
  "p-kinh-1": { origin: "Trang phục phổ biến trong đời sống, lễ nghi và nghệ thuật Việt Nam.", craft: "Lụa may theo đường cắt mềm mại, tạo dáng ôm thân và tà áo dài.", culturalValue: "Áo dài trở thành biểu tượng nhận diện văn hóa Việt, kết hợp nét kín đáo với sự duyên dáng." },
  "p-kinh-2": { origin: "Các làng nghề làm nón ở nhiều vùng đồng bằng Việt Nam.", craft: "Lá và nan tre được chọn, xếp, khâu đều trên khuôn để tạo dáng nón.", culturalValue: "Nón lá gắn với lao động, đời sống làng quê và hình ảnh người Việt trong văn hóa thị giác." },
}

export function getProductDetails(product: Product) {
  if (product.origin || product.craft || product.culturalValue) {
    const ethnic = ethnicGroups.find((group) => group.slug === product.ethnicSlug)
    return {
      origin: product.origin || (ethnic ? `Gắn với đời sống và nghề thủ công của cộng đồng ${ethnic.name}.` : "Gắn với đời sống văn hóa truyền thống của cộng đồng."),
      craft: product.craft || `Sản phẩm thuộc nhóm ${product.category.toLowerCase()}, được tạo nên từ kỹ thuật thủ công và kinh nghiệm truyền đời.`,
      culturalValue: product.culturalValue || product.description || (ethnic ? `${ethnic.culture.join(", ")}. ${ethnic.detail}` : "Sản phẩm phản ánh kỹ năng và bản sắc văn hóa địa phương."),
    }
  }

  if (productDetails[product.id]) return productDetails[product.id]

  const ethnic = ethnicGroups.find((group) => group.slug === product.ethnicSlug)
  return {
    origin: ethnic
      ? `Gắn với đời sống và nghề thủ công của cộng đồng ${ethnic.name}.`
      : "Gắn với đời sống văn hóa truyền thống của cộng đồng.",
    craft: `Sản phẩm thuộc nhóm ${product.category.toLowerCase()}, được tạo nên từ kỹ thuật thủ công và kinh nghiệm truyền đời.`,
    culturalValue: ethnic
      ? `${ethnic.culture.join(", ")}. ${ethnic.detail}`
      : product.description || "Sản phẩm phản ánh kỹ năng và bản sắc văn hóa địa phương.",
  }
}

export function formatVND(v: number) {
  return v.toLocaleString("vi-VN") + "₫"
}
