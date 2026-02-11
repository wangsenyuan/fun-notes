---
title: Java Streams Cheatsheet
tags: java, programming
date: 2025-02-11
---

A quick reference for common Java Stream operations.

## Creating Streams

```java
List<String> list = Arrays.asList("a", "b", "c");
Stream<String> s1 = list.stream();

String[] arr = {"x", "y", "z"};
Stream<String> s2 = Arrays.stream(arr);

Stream<Integer> s3 = Stream.of(1, 2, 3);
```

## Common Operations

| Operation | Purpose |
|-----------|---------|
| `filter(predicate)` | Keep elements matching predicate |
| `map(function)` | Transform each element |
| `flatMap(function)` | Flatten nested structures |
| `sorted()` | Sort (natural order) |
| `distinct()` | Remove duplicates |
| `limit(n)` | Take first n elements |
| `skip(n)` | Skip first n elements |

## Collectors

```java
List<String> list = stream.collect(Collectors.toList());
Set<String> set = stream.collect(Collectors.toSet());
String joined = stream.collect(Collectors.joining(", "));
Map<K, V> map = stream.collect(Collectors.toMap(k -> k, v -> v));
```

## Example: Filter and Map

```java
List<String> result = names.stream()
    .filter(n -> n.length() > 3)
    .map(String::toUpperCase)
    .collect(Collectors.toList());
```
