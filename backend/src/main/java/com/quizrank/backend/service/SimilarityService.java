package com.quizrank.backend.service;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SimilarityService {
 public record Score(double overall,double cosine,double jaccard,double ngram,List<String> matches) {}
 public Score compare(String originalA,String originalB) {
  String a=normal(originalA), b=normal(originalB);
  if(a.isBlank()||b.isBlank()) return new Score(0,0,0,0,List.of());
  List<String> ta=Arrays.asList(a.split(" ")), tb=Arrays.asList(b.split(" "));
  Map<String,Integer> fa=freq(ta), fb=freq(tb);
  Set<String> vocab=new HashSet<>(fa.keySet()); vocab.addAll(fb.keySet());
  double dot=0,na=0,nb=0;
  for(String t:vocab){
   int df=(fa.containsKey(t)?1:0)+(fb.containsKey(t)?1:0);
   double idf=Math.log(1.0+2.0/(1.0+df));
   double x=fa.getOrDefault(t,0)*idf,y=fb.getOrDefault(t,0)*idf;
   dot+=x*y;na+=x*x;nb+=y*y;
  }
  double cosine=na==0||nb==0?0:dot/(Math.sqrt(na)*Math.sqrt(nb));
  Set<String> sa=shingles(ta,4), sb=shingles(tb,4);
  Set<String> intersection=new HashSet<>(sa); intersection.retainAll(sb);
  Set<String> union=new HashSet<>(sa); union.addAll(sb);
  double jaccard=union.isEmpty()?0:(double)intersection.size()/union.size();
  double containment=Math.min(sa.isEmpty()?0:(double)intersection.size()/sa.size(),sb.isEmpty()?0:(double)intersection.size()/sb.size());
  // Combined score balances term-vector similarity and contiguous phrase overlap.
  double ngram=containment;
  double overall=(cosine*.35+jaccard*.25+ngram*.40)*100;
  List<String> matches=matchingSentences(originalA,originalB);
  return new Score(round(overall),round(cosine*100),round(jaccard*100),round(ngram*100),matches);
 }
 private String normal(String s){return s.toLowerCase(Locale.ROOT).replaceAll("[^\\p{L}\\p{N}\\s]"," ").replaceAll("\\s+"," ").trim();}
 private Map<String,Integer> freq(List<String> tokens){Map<String,Integer> m=new HashMap<>(); for(String t:tokens) if(t.length()>1)m.merge(t,1,Integer::sum); return m;}
 private Set<String> shingles(List<String> t,int n){Set<String>s=new HashSet<>(); for(int i=0;i+n<=t.size();i++)s.add(String.join(" ",t.subList(i,i+n))); if(s.isEmpty())s.addAll(t); return s;}
 private List<String> matchingSentences(String a,String b){
  Set<String> bs=Arrays.stream(b.split("(?<=[.!?।])\\s+")).map(this::normal).filter(x->x.length()>45).collect(Collectors.toSet());
  LinkedHashSet<String> found=new LinkedHashSet<>();
  for(String sentence:a.split("(?<=[.!?।])\\s+")){String n=normal(sentence); if(n.length()>45&&bs.contains(n))found.add(sentence.trim()); if(found.size()>=40)break;}
  return new ArrayList<>(found);
 }
 private double round(double v){return Math.round(v*100.0)/100.0;}
}
