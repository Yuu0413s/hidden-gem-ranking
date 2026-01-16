"use server";

import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";

// データベースから返ってくる生のデータの型 (カラム名は小文字)
type ShopDB = {
    id: number;
    name: string;
    upvotes: number;
    downvotes: number;
    created_at: Date;
};

// アプリで使う型 (キャメルケース)
export type Shop = {
    id: number;
    name: string;
    upVotes: number;
    downVotes: number;
};

// データを取得
export async function getShops(): Promise<Shop[]> {
  // 作成日時の新しい順に取得
  const { rows } = await sql<ShopDB>`SELECT * FROM shops ORDER BY created_at DESC`;

  // DBのカラム名(小文字)を、アプリで使いやすい名前(upVotesなど)に変換して返す
    return rows.map((row) => ({
        id: row.id,
        name: row.name,
        upVotes: row.upvotes,
        downVotes: row.downvotes,
    }));
}

// 店舗を追加
export async function addShop(name: string, up: number, down: number) {
    await sql`
        INSERT INTO shops (name, upvotes, downvotes)
        VALUES (${name}, ${up}, ${down})
    `;
    // データが変わったので、画面のキャッシュを更新するおまじない
    revalidatePath("/");
}