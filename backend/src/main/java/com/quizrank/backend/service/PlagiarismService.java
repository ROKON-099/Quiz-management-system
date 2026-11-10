package com.quizrank.backend.service;

import com.quizrank.backend.entity.*;
import com.quizrank.backend.repository.*;
import org.slf4j.Logger; import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.file.Path;
import java.util.*;

@Service
public class PlagiarismService {
 private static final Logger log=LoggerFactory.getLogger(PlagiarismService.class);
 private final AssignmentSubmissionRepository submissions;
 private final AssignmentRepository assignments;
 private final SimilarityReportRepository reports;
 private final UserRepository users;
 private final UploadStorageService storage;
 private final PdfTextExtractionService extractor;
 private final SimilarityService similarity;
 public PlagiarismService(AssignmentSubmissionRepository s,AssignmentRepository a,SimilarityReportRepository r,UserRepository u,UploadStorageService st,PdfTextExtractionService e,SimilarityService sim){
  submissions=s;assignments=a;reports=r;users=u;storage=st;extractor=e;similarity=sim;
 }
 @Async
 public void processSubmissionAsync(Integer submissionId) {
  try { processSubmission(submissionId,false); }
  catch(Exception ex){ log.error("Plagiarism processing failed for submission {}",submissionId,ex); }
 }
 @Async
 public void recheckSubmissionAsync(Integer submissionId) {
  try { processSubmission(submissionId,true); }
  catch(Exception ex){ log.error("Plagiarism recheck failed for submission {}",submissionId,ex); }
 }
 @Transactional
 public void processSubmission(Integer submissionId,boolean force) throws Exception {
  AssignmentSubmission current=submissions.findById(submissionId).orElseThrow();
  String currentText=extractor.extract(storage.path(current.getStoredName()));
  for(AssignmentSubmission other:submissions.findByAssignmentId(current.getAssignmentId())){
   if(other.getId().equals(current.getId()))continue;
   int left=Math.min(current.getId(),other.getId()), right=Math.max(current.getId(),other.getId());
   if(!force && reports.findBySubmissionAIdAndSubmissionBId(left,right).isPresent())continue;
   String otherText=extractor.extract(storage.path(other.getStoredName()));
   saveComparison(submissions.findById(left).orElseThrow(),submissions.findById(right).orElseThrow(),
      left==current.getId()?currentText:otherText,left==current.getId()?otherText:currentText);
  }
 }
 @Transactional
 public SimilarityReport compare(Integer aId,Integer bId) throws Exception {
  if(aId.equals(bId))throw new IllegalArgumentException("Select two different submissions.");
  AssignmentSubmission a=submissions.findById(aId).orElseThrow(()->new NoSuchElementException("Submission A not found"));
  AssignmentSubmission b=submissions.findById(bId).orElseThrow(()->new NoSuchElementException("Submission B not found"));
  if(!a.getAssignmentId().equals(b.getAssignmentId()))throw new IllegalArgumentException("Both submissions must belong to the same assignment.");
  int left=Math.min(aId,bId),right=Math.max(aId,bId);
  SimilarityReport existing=reports.findBySubmissionAIdAndSubmissionBId(left,right).orElse(null);
  String ta=extractor.extract(storage.path(a.getStoredName())),tb=extractor.extract(storage.path(b.getStoredName()));
  return saveComparison(submissions.findById(left).orElseThrow(),submissions.findById(right).orElseThrow(),
   left==aId?ta:tb,left==aId?tb:ta);
 }
 private SimilarityReport saveComparison(AssignmentSubmission a,AssignmentSubmission b,String textA,String textB){
  SimilarityService.Score score=similarity.compare(textA,textB);
  SimilarityReport r=reports.findBySubmissionAIdAndSubmissionBId(a.getId(),b.getId()).orElseGet(SimilarityReport::new);
  r.setAssignmentId(a.getAssignmentId());r.setSubmissionAId(a.getId());r.setSubmissionBId(b.getId());
  r.setStudentAId(a.getStudentId());r.setStudentBId(b.getStudentId());
  r.setSimilarityPercent(score.overall());r.setCosinePercent(score.cosine());r.setJaccardPercent(score.jaccard());r.setNgramPercent(score.ngram());
  r.setStatus(score.overall()>=70?"HIGH_SIMILARITY":score.overall()>=30?"NEEDS_REVIEW":"LOW_SIMILARITY");
  r.setMatchedCount(score.matches().size());r.setMatchedText(String.join("\\n\\n",score.matches()));
  return reports.save(r);
 }
 public List<SimilarityReport> assignmentReports(Integer assignmentId){return reports.findByAssignmentIdOrderBySimilarityPercentDesc(assignmentId);}
 public SimilarityReport getReport(Long id){return reports.findById(id).orElseThrow(()->new NoSuchElementException("Similarity report not found"));}
 public List<SimilarityReport> studentReports(Integer studentId){return reports.findByStudentAIdOrStudentBIdOrderByCreatedAtDesc(studentId,studentId);}
 public Assignment getAssignment(Integer id){return assignments.findById(id).orElseThrow(()->new NoSuchElementException("Assignment not found"));}
 public AssignmentSubmission getSubmission(Integer id){return submissions.findById(id).orElseThrow(()->new NoSuchElementException("Submission not found"));}
 public User getUser(Integer id){return users.findById(id).orElseThrow(()->new NoSuchElementException("User not found"));}
}
