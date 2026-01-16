"use client";

import { useState } from "react";
import { calculateBayesianScore, calculateSimpleAverage } from "@/utils/bayesian";

// 店舗データの型定義
type Shop = {
  id: number;
  name: string;
  upVotes: number;
  downVotes: number;
};

// 初期データ（極端な例を用意）
const initialShops: Shop[] = [
  { id: 1, name: "老舗A店 (高評価多数)", upVotes: 95, downVotes: 5 }, // 95%
  { id: 2, name: "新店B店 (1件だけ高評価)", upVotes: 1, downVotes: 0 }, // 100% (単純平均だと最強になってしまう)
  { id: 3, name: "中堅C店", upVotes: 18, downVotes: 2 }, // 90%
  { id: 4, name: "チェーンD店", upVotes: 300, downVotes: 100 }, // 75%
];

export default function Home() {
  const [shops, setShops] = useState<Shop[]>(initialShops);
  const [sortMode, setSortMode] = useState<"simple" | "bayesian">("simple");

  // 新規追加用のState
  const [newName, setNewName] = useState("");
  const [newUp, setNewUp] = useState(0);
  const [newDown, setNewDown] = useState(0);

  // 並び替え処理
  const sortedShops = [...shops].sort((a, b) => {
    if (sortMode === "simple") {
      return calculateSimpleAverage(b.upVotes, b.downVotes) - calculateSimpleAverage(a.upVotes, a.downVotes);
    } else {
      return calculateBayesianScore(b.upVotes, b.downVotes) - calculateBayesianScore(a.upVotes, a.downVotes);
    }
  });

  // 店舗追加処理
  const handleAddShop = (e: React.FormEvent) => {
    e.preventDefault();
    const newShop: Shop = {
      id: Date.now(),
      name: newName,
      upVotes: newUp,
      downVotes: newDown,
    };
    setShops([...shops, newShop]);
    setNewName("");
    setNewUp(0);
    setNewDown(0);
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">隠れた名店発見器</h1>
        <p className="text-gray-600 mb-8">
          講義第5章「ベイズ推定」を用いて、レビュー数が少ない店舗の信頼性を補正します。
        </p>

        {/* コントロールエリア */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <span className="font-semibold">並び替え基準:</span>
            <button
              onClick={() => setSortMode("simple")}
              className={`px-4 py-2 rounded ${
                sortMode === "simple" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              単純な平均率
            </button>
            <button
              onClick={() => setSortMode("bayesian")}
              className={`px-4 py-2 rounded ${
                sortMode === "bayesian" ? "bg-green-600 text-white" : "bg-gray-200"
              }`}
            >
              ベイズ推定スコア (推奨)
            </button>
          </div>
        </div>

        {/* ランキング表示 */}
        <div className="grid gap-4 mb-12">
          {sortedShops.map((shop, index) => {
            const simpleAvg = calculateSimpleAverage(shop.upVotes, shop.downVotes);
            const bayesScore = calculateBayesianScore(shop.upVotes, shop.downVotes);

            return (
              <div key={shop.id} className="bg-white p-6 rounded-lg shadow border-l-4 border-l-blue-500 flex justify-between items-center transition-all hover:shadow-md">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                    <h2 className="text-xl font-bold">{shop.name}</h2>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    高評価: {shop.upVotes} / 低評価: {shop.downVotes} (計 {shop.upVotes + shop.downVotes}件)
                  </p>
                </div>

                <div className="flex gap-8 text-right">
                  <div className={`flex flex-col ${sortMode === 'simple' ? 'font-bold text-blue-600' : 'text-gray-400'}`}>
                    <span className="text-xs">単純平均</span>
                    <span className="text-2xl">{(simpleAvg * 100).toFixed(1)}%</span>
                  </div>
                  <div className={`flex flex-col ${sortMode === 'bayesian' ? 'font-bold text-green-600' : 'text-gray-400'}`}>
                    <span className="text-xs">ベイズスコア</span>
                    <span className="text-2xl">{(bayesScore * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 入力フォーム */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">新しいデータを追加</h3>
          <form onSubmit={handleAddShop} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">店名</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="例: 路地裏のカフェ"
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium mb-1">高評価</label>
              <input
                type="number"
                min="0"
                value={newUp}
                onChange={(e) => setNewUp(Number(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium mb-1">低評価</label>
              <input
                type="number"
                min="0"
                value={newDown}
                onChange={(e) => setNewDown(Number(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <button type="submit" className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-black">
              追加
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}