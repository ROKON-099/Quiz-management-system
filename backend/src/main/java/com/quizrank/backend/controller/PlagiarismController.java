package com.quizrank.backend.controller;

import com.quizrank.backend.dto.ManualCompareRequest;
import com.quizrank.backend.entity.*;
import com.quizrank.backend.service.PlagiarismService;
import jakarta.validation.Valid;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.font.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.io.ByteArrayOutputStream;
import java.util.*;

@RestController
@RequestMapping("/api/plagiarism")
public class PlagiarismController {
 private final PlagiarismService service;
 public PlagiarismController(PlagiarismService s){service=s;}
 private User require(Integer id,User.Role role){
  User u=service.getUser(id);
  if(u.getRole()!=role)throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN,"Not allowed");
  return u;
 }
 private void teacherOwns(Integer teacherId,Integer assignmentId){
  require(teacherId,User.Role.TEACHER);
  if(!service.getAssignment(assignmentId).getTeacherId().equals(teacherId))
   throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN,"This assignment does not belong to this teacher.");
 }
 @GetMapping("/assignment/{assignmentId}")
 public List<Map<String,Object>> assignmentReports(@PathVariable Integer assignmentId,@RequestParam Integer teacherId){
  teacherOwns(teacherId,assignmentId);
  return service.assignmentReports(assignmentId).stream().map(this::toMap).toList();
 }
 @GetMapping("/student/{studentId}")
 public List<Map<String,Object>> studentReports(@PathVariable Integer studentId,@RequestParam Integer requesterId){
  if(!studentId.equals(requesterId))throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN,"You can only view your own reports.");
  require(requesterId,User.Role.STUDENT);
  return service.studentReports(studentId).stream().map(this::toMap).toList();
 }
 @GetMapping("/report/{reportId}")
 public Map<String,Object> report(@PathVariable Long reportId,@RequestParam Integer requesterId){
  SimilarityReport r=service.getReport(reportId); User u=service.getUser(requesterId);
  if(u.getRole()==User.Role.TEACHER)teacherOwns(requesterId,r.getAssignmentId());
  else if(u.getRole()!=User.Role.STUDENT||(!requesterId.equals(r.getStudentAId())&&!requesterId.equals(r.getStudentBId())))
   throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN,"You cannot view this report.");
  return toMap(r);
 }
 @PostMapping("/compare")
 public Map<String,Object> compare(@Valid @RequestBody ManualCompareRequest req) throws Exception {
  require(req.teacherId(),User.Role.TEACHER);
  AssignmentSubmission a=service.getSubmission(req.submissionAId());
  AssignmentSubmission b=service.getSubmission(req.submissionBId());
  teacherOwns(req.teacherId(),a.getAssignmentId());
  if(!a.getAssignmentId().equals(b.getAssignmentId()))throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST,"Both submissions must belong to the same assignment.");
  return toMap(service.compare(a.getId(),b.getId()));
 }
 @PostMapping("/recheck/{submissionId}")
 public ResponseEntity<Map<String,String>> recheck(@PathVariable Integer submissionId,@RequestParam Integer teacherId){
  AssignmentSubmission s=service.getSubmission(submissionId);teacherOwns(teacherId,s.getAssignmentId());
  service.recheckSubmissionAsync(submissionId);
  return ResponseEntity.accepted().body(Map.of("message","Similarity recheck has been queued."));
 }
 @GetMapping("/statistics")
 public Map<String,Object> statistics(@RequestParam Integer teacherId,@RequestParam Integer assignmentId){
  teacherOwns(teacherId,assignmentId);
  List<SimilarityReport> all=service.assignmentReports(assignmentId);
  return Map.of("total",all.size(),"highSimilarity",all.stream().filter(x->"HIGH_SIMILARITY".equals(x.getStatus())).count(),
   "needsReview",all.stream().filter(x->"NEEDS_REVIEW".equals(x.getStatus())).count(),
   "lowSimilarity",all.stream().filter(x->"LOW_SIMILARITY".equals(x.getStatus())).count());
 }
 @GetMapping("/search")
 public List<Map<String,Object>> search(@RequestParam Integer teacherId,@RequestParam Integer assignmentId,
  @RequestParam(required=false) String student,@RequestParam(required=false) String status,
  @RequestParam(required=false) Double minScore,@RequestParam(required=false) Double maxScore){
  teacherOwns(teacherId,assignmentId);
  return service.assignmentReports(assignmentId).stream().filter(r->status==null||status.isBlank()||r.getStatus().equals(status))
   .filter(r->minScore==null||r.getSimilarityPercent()>=minScore).filter(r->maxScore==null||r.getSimilarityPercent()<=maxScore)
   .filter(r->student==null||student.isBlank()||containsStudent(r,student)).map(this::toMap).toList();
 }
 private boolean containsStudent(SimilarityReport r,String q){
  String x=q.toLowerCase(Locale.ROOT);
  return service.getUser(r.getStudentAId()).getName().toLowerCase(Locale.ROOT).contains(x)
   ||service.getUser(r.getStudentBId()).getName().toLowerCase(Locale.ROOT).contains(x)
   ||service.getUser(r.getStudentAId()).getUserId().toLowerCase(Locale.ROOT).contains(x)
   ||service.getUser(r.getStudentBId()).getUserId().toLowerCase(Locale.ROOT).contains(x);
 }
 @GetMapping(value="/report/{reportId}/pdf",produces=MediaType.APPLICATION_PDF_VALUE)
 public ResponseEntity<byte[]> downloadPdf(@PathVariable Long reportId,@RequestParam Integer requesterId) throws Exception {
  Map<String,Object> data=report(reportId,requesterId);
  try(PDDocument doc=new PDDocument();ByteArrayOutputStream out=new ByteArrayOutputStream()){
   PDPage page=new PDPage();doc.addPage(page);
   try(PDPageContentStream cs=new PDPageContentStream(doc,page)){
    cs.beginText();cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA),10);cs.newLineAtOffset(50,750);
    String[] lines=("QuizRank Similarity Report\nReport ID: "+data.get("id")+"\nAssignment ID: "+data.get("assignmentId")
      +"\nSimilarity: "+data.get("similarityPercent")+"%\nStatus: "+data.get("status")+"\nCosine: "+data.get("cosinePercent")
      +"%  Jaccard: "+data.get("jaccardPercent")+"%  N-gram: "+data.get("ngramPercent")+"%\nMatched text:\n"+data.get("matchedText")).split("\\n");
    for(String line:lines){String safe=line.replaceAll("[^\\x20-\\x7E]","?");cs.showText(safe.length()>110?safe.substring(0,110):safe);cs.newLineAtOffset(0,-14);}
    cs.endText();
   }
   doc.save(out);
   return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=similarity-report-"+reportId+".pdf").body(out.toByteArray());
  }
 }
 private Map<String,Object> toMap(SimilarityReport r){
  User a=service.getUser(r.getStudentAId()),b=service.getUser(r.getStudentBId());
  Map<String,Object> m=new LinkedHashMap<>();m.put("id",r.getId());m.put("assignmentId",r.getAssignmentId());
  m.put("submissionAId",r.getSubmissionAId());m.put("submissionBId",r.getSubmissionBId());
  m.put("studentAId",r.getStudentAId());m.put("studentAName",a.getName());m.put("studentAUserId",a.getUserId());
  m.put("studentBId",r.getStudentBId());m.put("studentBName",b.getName());m.put("studentBUserId",b.getUserId());
  m.put("similarityPercent",r.getSimilarityPercent());m.put("cosinePercent",r.getCosinePercent());m.put("jaccardPercent",r.getJaccardPercent());
  m.put("ngramPercent",r.getNgramPercent());m.put("status",r.getStatus());m.put("matchedCount",r.getMatchedCount());m.put("matchedText",r.getMatchedText());m.put("createdAt",r.getCreatedAt());return m;
 }
}
