---
title: Wavelet Tree 核心洞察与伪代码
tags: data-structure, competitive-programming, wavelet-tree, algorithm
date: 2026-03-12
---

Wavelet Tree 是一种用于**对整数序列高效回答区间查询**的数据结构。它的核心价值不在于压缩，而在于以 O(log σ) 的时间支持多种"第 k 小"、"区间计数"、"rank"等查询，且可以与其他结构组合扩展。

---

## 核心思想

**把值域的二分递归嵌入到序列结构中。**

给定序列 S，将值域 [l, r] 从中点 m 一分为二：
- 值 ≤ m 的元素组成左子序列
- 值 > m 的元素组成右子序列
- 递归至叶节点（区间只含单一值）

树高 O(log σ)，σ 是值域大小。

关键洞察：**不需要真正存储每层的子序列**，只需在每个节点存一个前缀计数数组 C，记录"到位置 i 为止，有多少元素被分到右边"（即值 > m）。

---

## 两个核心映射操作

每个节点 v 维护数组 `C[0..n]`，其中 `C[i]` = 前 i 个元素中值 > m 的个数。

```
// 位置 i 映射到左子节点的位置
mapLeft(v, i) = i - C[i]

// 位置 i 映射到右子节点的位置
mapRight(v, i) = C[i] - 1   // 0-indexed
```

这两个操作 O(1)，是所有查询的基础。

---

## 三种核心查询

### 1. Rank：统计出现次数

`rank(S, q, i)` = 序列 S 前 i 个元素中，值等于 q 的个数。

```
rank(node, q, i):
    if node is leaf:
        return i  // 叶节点所有元素都等于 q
    if q <= node.mid:
        return rank(node.left, q, mapLeft(node, i))
    else:
        return rank(node.right, q, mapRight(node, i))
```

区间 [i, j] 内 q 的出现次数 = `rank(S, q, j) - rank(S, q, i-1)`

**复杂度：O(log σ)**

---

### 2. Range Quantile（区间第 k 小）

`quantile(S, k, i, j)` = 子序列 S[i..j] 中第 k 小的值。

```
quantile(node, k, i, j):
    if node is leaf:
        return node.value
    // 统计 [i,j] 中有多少元素去了左边
    c = mapLeft(node, j) - mapLeft(node, i-1)
    if k <= c:
        // 第 k 小在左子树
        return quantile(node.left, k,
                        mapLeft(node, i-1) + 1,
                        mapLeft(node, j))
    else:
        // 第 k 小在右子树，排名变为 k-c
        return quantile(node.right, k - c,
                        mapRight(node, i-1) + 1,
                        mapRight(node, j))
```

**关键洞察**：每层只走一个分支，树高 O(log σ)，总复杂度 O(log σ)。

---

### 3. Range Counting（区间值域计数）

`range(S, [x,y], i, j)` = S[i..j] 中值在 [x, y] 之间的元素个数。

```
range(node, x, y, i, j):
    if [node.l, node.r] ∩ [x, y] == ∅:
        return 0
    if [node.l, node.r] ⊆ [x, y]:
        return j - i + 1   // 整段都在范围内
    // 部分重叠，递归两子树
    return range(node.left,  x, y, mapLeft(node, i-1)+1,  mapLeft(node, j))
         + range(node.right, x, y, mapRight(node, i-1)+1, mapRight(node, j))
```

**复杂度：O(log σ)**（最多 O(log σ) 个递归分支）

---

## 构建

```
build(A, l, r):
    // A 是当前节点的子序列，[l,r] 是值域
    if l == r: return leaf(l)
    mid = (l + r) / 2
    // 计算前缀右计数数组 C
    C[0] = 0
    for i in 1..len(A):
        C[i] = C[i-1] + (A[i] > mid ? 1 : 0)
    // 稳定划分
    A_left  = [a for a in A if a <= mid]
    A_right = [a for a in A if a > mid]
    node.left  = build(A_left,  l, mid)
    node.right = build(A_right, mid+1, r)
    return node
```

空间：O(n log σ)，因为每层总元素数为 n。

---

## 支持动态更新

### Swap（交换相邻元素 i 和 i+1）

只需沿树向下找到**两个元素分配到不同子树**的那层节点，更新 C 数组。

```
swap(node, i):
    // i 和 i+1 都去左边或都去右边 → 递归下去，不更新 C
    if A[i] <= mid and A[i+1] <= mid:
        swap(node.left, mapLeft(node, i))
    elif A[i] > mid and A[i+1] > mid:
        swap(node.right, mapRight(node, i))
    else:
        // 一个去左，一个去右 → 更新 C[i]（+1 或 -1）
        update C[i] accordingly
        // 不需要递归，子序列中它们不再相邻
```

**复杂度：O(log σ)**

### Toggle（激活/停用元素）

每个节点额外维护 `activeLeft[i]` = 前 i 个元素中，去往左子树的**活跃**元素数。用 BIT（树状数组）实现以支持点更新。

查询时将 `mapLeft(node, j) - mapLeft(node, i-1)` 替换为 `activeLeft(j) - activeLeft(i-1)`，其余逻辑不变。

**复杂度：O(log n · log σ)**（每层一次 BIT 操作）

---

## Wavelet Matrix（大值域优化）

当 σ 很大（如 10⁹），指针型 Wavelet Tree 空间 O(σ) 不可接受。

**Wavelet Matrix** 的思路：
- 按层（而非按节点）存储，每层一个全局 bitvector
- 每层把所有 0（值 ≤ mid）排在前面，1（值 > mid）排在后面
- 维护每层"有多少元素去了左边"的数量 z_l

映射公式（level l）：
```
// 位置 i 映射到下一层
if bit[l][i] == 0:  // 去左边
    next_pos = i - C_l[i]          // C_l[i] = 前 i 个中 1 的个数
else:               // 去右边
    next_pos = z_l + C_l[i] - 1
```

空间仅 O(n log σ)，不需要树指针，实现更简单。

---

## 与其他结构对比

| 结构 | 区间第k小 | 区间计数 | 支持swap | 内存 |
|------|-----------|----------|---------|------|
| 归并树 | O(log²n) | O(log²n) | 难 | O(n log n) |
| 持久化线段树 | O(log n) | O(log n) | 需大改 | O(n log n)，常数大 |
| Wavelet Tree | O(log σ) | O(log σ) | O(log σ) | O(n log σ)，常数小 |


---

## 一句话总结

Wavelet Tree 的本质是：**用值域的二分递归把"排名/计数"问题分解到叶节点**，每层只需一个前缀计数数组 C，O(1) 完成节点间的位置映射，从而以 O(log σ) 回答各种区间有序统计查询。
