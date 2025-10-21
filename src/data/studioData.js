export const studioData = {
  onpukan: {
    area: "おんぷ館",
    address: "〒466-0833 愛知県名古屋市昭和区隼人町3-10",
    studios: [
      {
        id: "onpukan-a",
        name: "Aスタジオ",
        icon: "🎹",
        equipment: ["グランドピアノ（ヤマハC3X）", "椅子", "譜面台"],
        capacity: 2,
        pricing: {
          general: 800,    // 一般（30分単位）
          student: 550     // 生徒（30分単位）
        },
        features: ["防音", "空調", "グランドピアノ"]
      },
      {
        id: "onpukan-b",
        name: "Bスタジオ",
        icon: "🎹",
        equipment: ["アップライトピアノ", "椅子", "譜面台"],
        capacity: 2,
        pricing: {
          general: 550,
          student: 330
        },
        features: ["防音", "空調"]
      },
      {
        id: "onpukan-c",
        name: "Cスタジオ",
        icon: "🎵",
        equipment: ["防音室", "譜面台", "椅子"],
        capacity: 3,
        pricing: {
          general: 550,
          student: 330
        },
        features: ["防音", "楽器持込可"]
      },
      {
        id: "onpukan-d",
        name: "Dスタジオ",
        icon: "🎵",
        equipment: ["防音室", "譜面台", "椅子"],
        capacity: 3,
        pricing: { general: 550, student: 330 },
        features: ["防音", "楽器持込可"]
      },
      {
        id: "onpukan-e",
        name: "Eスタジオ",
        icon: "🎵",
        equipment: ["防音室", "譜面台", "椅子"],
        capacity: 3,
        pricing: { general: 550, student: 330 },
        features: ["防音", "楽器持込可"]
      },
      {
        id: "onpukan-f",
        name: "Fスタジオ",
        icon: "🎵",
        equipment: ["防音室", "譜面台", "椅子"],
        capacity: 3,
        pricing: { general: 550, student: 330 },
        features: ["防音", "楽器持込可"]
      },
      {
        id: "onpukan-g",
        name: "Gスタジオ",
        icon: "🎵",
        equipment: ["防音室", "譜面台", "椅子"],
        capacity: 3,
        pricing: { general: 550, student: 330 },
        features: ["防音", "楽器持込可"]
      }
    ]
  },
  midori: {
    area: "みどり楽器",
    address: "おんぷ館向かい",
    studios: [
      {
        id: "midori-drum-a",
        name: "ドラム室A",
        icon: "🥁",
        equipment: ["Pearl ドラムセット", "シンバル各種", "ツインペダル"],
        capacity: 2,
        pricing: {
          general: 500,
          student: 350
        },
        features: ["防音", "空調", "スティック貸出"]
      },
      {
        id: "midori-drum-b",
        name: "ドラム室B",
        icon: "🥁",
        equipment: ["YAMAHA ドラムセット", "電子ドラム（練習用）"],
        capacity: 2,
        pricing: {
          general: 500,
          student: 350
        },
        features: ["防音", "空調", "静音練習可"]
      },
      {
        id: "midori-guitar",
        name: "ギター・ベース室",
        icon: "🎸",
        equipment: ["Marshall アンプ", "BOSS エフェクター", "シールド"],
        capacity: 3,
        pricing: {
          general: 550,
          student: 330
        },
        features: ["防音", "空調", "機材レンタル"]
      }
    ]
  }
};
