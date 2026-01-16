"use client";

import { useState, useEffect } from "react";
import { calculateBayesianScore, calculateSimpleAverage } from "@/utils/bayesian";
// 作った裏側の処理をインポート
import { getShops, addShop, Shop } from "./actions";

export default function Home() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [sortMode, setSortMode] = useState<"simple" | "bayesian">("simple");
  const [newName, setNewName] = useState("");
  const [newUp, setNewUp] = useState(0);
  const [newDown, setNewDown] = useState(0);
  const [loading, setLoading] = useState(true);

  // 画面が表示されたら、DBからデータを読み込む
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getShops();
        setShops(data);
      } catch (error) {
        console.error("データの取得に失敗しました", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 追加ボタンが押された時の処理
  const handleAddShop = async (e: React.FormEvent) => {
    e.preventDefault();

    // DBに追加
    await addShop(newName, newUp, newDown);

    // 画面のリストも最新にするために再取得
    const data = await getShops();
    setShops(data);

    // フォームを空にする
    setNewName("");
    setNewUp(0);
    setNewDown(0);
  };

  // 並び替え処理
  const sortedShops = [...shops].sort((a, b) => {
    if (sortMode === "simple") {
      return calculateSimpleAverage(b.upVotes, b.downVotes) - calculateSimpleAverage(a.upVotes, a.downVotes);
    } else {
      return calculateBayesianScore(b.upVotes, b.downVotes) - calculateBayesianScore(a.upVotes, a.downVotes);
    }
  });

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">隠れた名店発見器 (DB保存版)</h1>
        <p className="text-gray-600 mb-8">
          追加したデータはVercelのデータベースに保存され、リロードしても消えません。
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
          {loading && <p className="text-center py-10">読み込み中...</p>}
          {!loading && sortedShops.length === 0 && (
            <p className="text-center py-10 text-gray-500">データがありません。下から追加してください。</p>
          )}

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
                    高評価: {shop.upVotes} / 低評価: {shop.downVotes}
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