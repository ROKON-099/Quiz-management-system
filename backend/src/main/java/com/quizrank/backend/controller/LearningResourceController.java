package com.quizrank.backend.controller;

import com.quizrank.backend.dto.GradeAssignmentRequest;
import com.quizrank.backend.entity.*;
import com.quizrank.backend.repository.*;
import com.quizrank.backend.service.UploadStorageService;
import com.quizrank.backend.service.PlagiarismService;

import jakarta.validation.Valid;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.dao.DataIntegrityViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api")
public class LearningResourceController {

    private static final Logger log =
            LoggerFactory.getLogger(LearningResourceController.class);

    private final AssignmentRepository assignments;
    private final LearningMaterialRepository materials;
    private final AssignmentSubmissionRepository submissions;
    private final AssignmentResultRepository results;
    private final UserRepository users;
    private final StudentCourseRepository courses;
    private final UploadStorageService storage;
    private final PlagiarismService plagiarismService;

    public LearningResourceController(
            AssignmentRepository a,
            LearningMaterialRepository m,
            AssignmentSubmissionRepository s,
            AssignmentResultRepository r,
            UserRepository u,
            StudentCourseRepository c,
            UploadStorageService st,
            PlagiarismService ps) {

        assignments = a;
        materials = m;
        submissions = s;
        results = r;
        users = u;
        courses = c;
        storage = st;
        plagiarismService = ps;
    }

    // =====================================================
    // COMMON METHODS
    // =====================================================

    private User requireRole(Integer id, User.Role role) {

        User u = users.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));

        if (u.getRole() != role) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Not allowed"
            );
        }

        return u;
    }

    private void requireTeacherOwnsAssignment(
            Integer teacherId,
            Assignment a) {

        requireRole(teacherId, User.Role.TEACHER);

        if (!a.getTeacherId().equals(teacherId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "This assignment does not belong to this teacher"
            );
        }
    }

    private void requireStudentEnrolled(
            Integer studentId,
            Integer subjectId) {

        requireRole(studentId, User.Role.STUDENT);

        if (subjectId != null &&
                courses.findByStudentId(studentId)
                        .stream()
                        .noneMatch(c -> subjectId.equals(c.getSubjectId()))) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not enrolled in this subject"
            );
        }
    }

    private ResponseEntity<Resource> download(
            String stored,
            String name) {

        try {

            Path p = storage.path(stored);
            Resource r = new UrlResource(p.toUri());

            if (!r.exists() || !r.isReadable()) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "File not found"
                );
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            ContentDisposition.attachment()
                                    .filename(name)
                                    .build()
                                    .toString()
                    )
                    .body(r);

        } catch (ResponseStatusException e) {

            throw e;

        } catch (Exception e) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "File not found"
            );
        }
    }

    private Assignment getAssignment(Integer id) {

        return assignments.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Assignment not found"
                ));
    }

    private LearningMaterial getMaterial(Integer id) {

        return materials.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Class note not found"
                ));
    }

    // =====================================================
    // ASSIGNMENTS
    // =====================================================

    // All assignments
    @GetMapping("/assignments")
    public List<Assignment> assignments() {

        try {
            return assignments.findAllByOrderByCreatedAtDesc();
        } catch (RuntimeException e) {
            log.error("Failed to load assignments from database", e);
            throw e;
        }
    }

    // Teacher assignments
    @GetMapping("/assignments/teacher/{teacherId}")
    public List<Assignment> teacherAssignments(
            @PathVariable Integer teacherId) {

        requireRole(teacherId, User.Role.TEACHER);

        return assignments.findByTeacherIdOrderByCreatedAtDesc(
                teacherId
        );
    }

    // Student assignments with submission status
    @GetMapping("/assignments/student/{studentId}")
    public List<Map<String, Object>> studentAssignments(
            @PathVariable Integer studentId) {

        requireRole(studentId, User.Role.STUDENT);

        Set<Integer> enrolled = new HashSet<>();

        courses.findByStudentId(studentId)
                .forEach(c -> enrolled.add(c.getSubjectId()));

        List<Map<String, Object>> response = new ArrayList<>();

        List<Assignment> allAssignments =
                assignments.findAllByOrderByCreatedAtDesc();

        for (Assignment a : allAssignments) {

            // Show general assignments and enrolled subject assignments
            if (a.getSubjectId() != null &&
                    !enrolled.contains(a.getSubjectId())) {

                continue;
            }

            // Check previous submission
            AssignmentSubmission submission =
                    submissions.findByAssignmentIdAndStudentId(
                            a.getId(),
                            studentId
                    ).orElse(null);

            Map<String, Object> row = new LinkedHashMap<>();

            row.put("id", a.getId());
            row.put("teacherId", a.getTeacherId());
            row.put("subjectId", a.getSubjectId());
            row.put("title", a.getTitle());
            row.put("description", a.getDescription());
            row.put("dueDate", a.getDueDate());
            row.put("fileName", a.getFileName());
            row.put("createdAt", a.getCreatedAt());

            row.put("submitted", submission != null);

            row.put(
                    "submissionId",
                    submission == null ? null : submission.getId()
            );

            row.put(
                    "submittedAt",
                    submission == null
                            ? null
                            : submission.getSubmittedAt()
            );

            response.add(row);
        }

        return response;
    }

    // Teacher creates assignment
    @PostMapping(
            value = "/assignments",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Assignment createAssignment(
            @RequestParam Integer teacherId,
            @RequestParam(required = false) Integer subjectId,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String dueDate,
            @RequestPart("file") MultipartFile file) throws Exception {

        requireRole(teacherId, User.Role.TEACHER);

        if (title == null || title.isBlank() || title.length() > 180) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Title is required (max 180 characters)"
            );
        }

        Assignment a = new Assignment();

        a.setTeacherId(teacherId);
        a.setSubjectId(subjectId);
        a.setTitle(title.trim());
        a.setDescription(description);

        try {

            a.setDueDate(
                    dueDate == null || dueDate.isBlank()
                            ? null
                            : LocalDate.parse(dueDate)
            );

        } catch (Exception e) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid due date"
            );
        }

        a.setFileName(
                file.getOriginalFilename() == null
                        ? "assignment.pdf"
                        : file.getOriginalFilename()
        );

        a.setStoredName(storage.savePdf(file));

        return assignments.save(a);
    }

    // Download assignment PDF
    @GetMapping("/assignments/{id}/download")
    public ResponseEntity<Resource> assignmentDownload(
            @PathVariable Integer id) {

        Assignment a = getAssignment(id);

        return download(
                a.getStoredName(),
                a.getFileName()
        );
    }

    // Delete assignment
    @DeleteMapping("/assignments/{id}")
    public ResponseEntity<Void> deleteAssignment(
            @PathVariable Integer id,
            @RequestParam Integer teacherId) throws Exception {

        Assignment a = getAssignment(id);

        requireTeacherOwnsAssignment(teacherId, a);

        for (AssignmentSubmission sub : submissions.findByAssignmentId(id)) {

            storage.delete(sub.getStoredName());

            submissions.delete(sub);
        }

        results.findByAssignmentIdOrderByGradedAtDesc(id)
                .forEach(results::delete);

        storage.delete(a.getStoredName());

        assignments.delete(a);

        return ResponseEntity.noContent().build();
    }

    // =====================================================
    // STUDENT SUBMISSION
    // ONE SUBMISSION PER STUDENT PER ASSIGNMENT
    // =====================================================

    @PostMapping(
            value = "/assignments/{id}/submissions",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public AssignmentSubmission submitAssignment(
            @PathVariable Integer id,
            @RequestParam Integer studentId,
            @RequestPart("file") MultipartFile file) throws Exception {

        Assignment assignment = getAssignment(id);

        requireStudentEnrolled(studentId, assignment.getSubjectId());

        // Deadline check
        if (assignment.getDueDate() != null &&
                LocalDate.now().isAfter(assignment.getDueDate())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Assignment submission deadline has passed"
            );
        }

        // File validation
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please select a PDF file"
            );
        }

        String originalName = file.getOriginalFilename();

        if (originalName == null ||
                !originalName.toLowerCase(Locale.ROOT).endsWith(".pdf")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only PDF files are allowed"
            );
        }

        // Find an existing submission. If present, replace its PDF instead
        // of inserting a second row (the database has a unique assignment/student key).
        AssignmentSubmission submission =
                submissions.findByAssignmentIdAndStudentId(id, studentId)
                        .orElseGet(AssignmentSubmission::new);

        boolean isResubmission = submission.getId() != null;
        String oldStoredName = isResubmission
                ? submission.getStoredName()
                : null;

        // Store the new PDF first. Keep the old PDF until the DB update succeeds.
        String newStoredName = storage.savePdf(file);

        submission.setAssignmentId(id);
        submission.setStudentId(studentId);
        submission.setFileName(originalName);
        submission.setStoredName(newStoredName);

        final AssignmentSubmission saved;
        try {
            saved = submissions.saveAndFlush(submission);
        } catch (DataIntegrityViolationException e) {
            log.error(
                    "Database constraint violation for assignment {} and student {}",
                    id,
                    studentId,
                    e
            );
            storage.delete(newStoredName);
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Submission could not be saved because of a database constraint."
            );
        } catch (RuntimeException e) {
            log.error(
                    "Failed to save submission for assignment {} and student {}",
                    id,
                    studentId,
                    e
            );
            storage.delete(newStoredName);
            throw e;
        }

        // The database update succeeded; now the previous PDF can be removed.
        if (isResubmission && oldStoredName != null &&
                !oldStoredName.equals(newStoredName)) {
            try {
                storage.delete(oldStoredName);
            } catch (Exception e) {
                // Do not fail the successful submission if old-file cleanup fails.
                log.warn("Could not delete previous submission file {}", oldStoredName, e);
            }
        }

        // Plagiarism analysis must not undo or fail a successful submission.
        try {
            plagiarismService.processSubmissionAsync(saved.getId());
        } catch (Exception e) {
            log.error(
                    "Could not start plagiarism analysis for submission {}",
                    saved.getId(),
                    e
            );
        }

        return saved;
    }

    // =====================================================
    // TEACHER REVIEW SUBMISSIONS
    // =====================================================

    @GetMapping(
            "/assignments/{id}/submissions/teacher/{teacherId}"
    )
    public List<Map<String, Object>> assignmentSubmissions(
            @PathVariable Integer id,
            @PathVariable Integer teacherId) {

        Assignment a = getAssignment(id);

        requireTeacherOwnsAssignment(teacherId, a);

        List<Map<String, Object>> out = new ArrayList<>();

        for (AssignmentSubmission s :
                submissions.findByAssignmentId(id)) {

            User student = users.findById(s.getStudentId())
                    .orElse(null);

            AssignmentResult grade =
                    results.findBySubmissionId(s.getId())
                            .orElse(null);

            Map<String, Object> row = new LinkedHashMap<>();

            row.put("serial", out.size() + 1);
            row.put("submissionId", s.getId());
            row.put("assignmentId", id);
            row.put("studentId", s.getStudentId());

            row.put(
                    "studentName",
                    student == null ? "Unknown" : student.getName()
            );

            row.put(
                    "userId",
                    student == null ? "" : student.getUserId()
            );

            row.put("fileName", s.getFileName());
            row.put("submittedAt", s.getSubmittedAt());

            row.put(
                    "downloadUrl",
                    "/api/submissions/" + s.getId() + "/download"
            );

            row.put(
                    "grade",
                    grade == null ? null : grade.getGrade()
            );

            row.put(
                    "feedback",
                    grade == null ? null : grade.getFeedback()
            );

            row.put(
                    "gradedAt",
                    grade == null ? null : grade.getGradedAt()
            );

            out.add(row);
        }

        out.sort(
                Comparator.comparing(
                        m -> String.valueOf(m.get("submittedAt"))
                )
        );

        return out;
    }

    // Teacher downloads student submission PDF
    @GetMapping("/submissions/{id}/download")
    public ResponseEntity<Resource> submissionDownload(
            @PathVariable Integer id) {

        AssignmentSubmission s = submissions.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Submission not found"
                ));

        return download(
                s.getStoredName(),
                s.getFileName()
        );
    }

    // =====================================================
    // TEACHER MARKING
    // POOR / AVG / GOOD
    // =====================================================

    @PutMapping(
            "/assignments/{assignmentId}/submissions/{submissionId}/grade"
    )
    public AssignmentResult grade(
            @PathVariable Integer assignmentId,
            @PathVariable Integer submissionId,
            @RequestParam Integer teacherId,
            @Valid @RequestBody GradeAssignmentRequest req) {

        Assignment a = getAssignment(assignmentId);

        requireTeacherOwnsAssignment(teacherId, a);

        AssignmentSubmission sub =
                submissions.findById(submissionId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Submission not found"
                        ));

        if (!sub.getAssignmentId().equals(assignmentId)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Submission does not belong to this assignment"
            );
        }

        AssignmentResult result =
                results.findBySubmissionId(submissionId)
                        .orElseGet(AssignmentResult::new);

        result.setAssignmentId(assignmentId);
        result.setSubmissionId(submissionId);
        result.setStudentId(sub.getStudentId());
        result.setGrade(req.grade());
        result.setFeedback(req.feedback());
        result.setGradedBy(teacherId);

        return results.save(result);
    }

    // =====================================================
    // TEACHER ASSIGNMENT RESULTS
    // =====================================================

    @GetMapping(
            "/assignments/{id}/results/teacher/{teacherId}"
    )
    public List<Map<String, Object>> assignmentResults(
            @PathVariable Integer id,
            @PathVariable Integer teacherId) {

        Assignment a = getAssignment(id);

        requireTeacherOwnsAssignment(teacherId, a);

        List<Map<String, Object>> out = new ArrayList<>();

        for (AssignmentSubmission s :
                submissions.findByAssignmentId(id)) {

            User u = users.findById(s.getStudentId())
                    .orElse(null);

            AssignmentResult g =
                    results.findBySubmissionId(s.getId())
                            .orElse(null);

            Map<String, Object> row = new LinkedHashMap<>();

            row.put("serial", out.size() + 1);

            row.put(
                    "studentName",
                    u == null ? "Unknown" : u.getName()
            );

            row.put("studentId", s.getStudentId());

            row.put(
                    "userId",
                    u == null ? "" : u.getUserId()
            );

            row.put("fileName", s.getFileName());
            row.put("submittedAt", s.getSubmittedAt());

            row.put(
                    "grade",
                    g == null ? "PENDING" : g.getGrade()
            );

            row.put(
                    "feedback",
                    g == null ? null : g.getFeedback()
            );

            row.put(
                    "gradedAt",
                    g == null ? null : g.getGradedAt()
            );

            out.add(row);
        }

        return out;
    }

    // =====================================================
    // STUDENT ASSIGNMENT RESULTS
    // =====================================================

    @GetMapping("/assignments/results/student/{studentId}")
    public List<Map<String, Object>> studentResults(
            @PathVariable Integer studentId) {

        requireRole(studentId, User.Role.STUDENT);

        List<Map<String, Object>> out = new ArrayList<>();

        for (AssignmentResult g :
                results.findByStudentIdOrderByGradedAtDesc(studentId)) {

            Assignment a = assignments.findById(g.getAssignmentId())
                    .orElse(null);

            Map<String, Object> row = new LinkedHashMap<>();

            row.put("assignmentId", g.getAssignmentId());

            row.put(
                    "assignmentTitle",
                    a == null ? "Assignment" : a.getTitle()
            );

            row.put("grade", g.getGrade());
            row.put("feedback", g.getFeedback());
            row.put("gradedAt", g.getGradedAt());

            out.add(row);
        }

        return out;
    }

    // =====================================================
    // EXPORT ASSIGNMENT RESULT PDF
    // =====================================================

    @GetMapping(
            value = "/assignments/{id}/results/teacher/{teacherId}/pdf",
            produces = "application/pdf"
    )
    public ResponseEntity<byte[]> exportResultsPdf(
            @PathVariable Integer id,
            @PathVariable Integer teacherId) throws Exception {

        Assignment a = getAssignment(id);

        requireTeacherOwnsAssignment(teacherId, a);

        List<Map<String, Object>> rows =
                assignmentResults(id, teacherId);

        try (
                PDDocument doc = new PDDocument();
                ByteArrayOutputStream bytes = new ByteArrayOutputStream()
        ) {

            PDPage page = new PDPage();

            doc.addPage(page);

            PDType1Font font = new PDType1Font(
                    Standard14Fonts.FontName.HELVETICA
            );

            PDType1Font bold = new PDType1Font(
                    Standard14Fonts.FontName.HELVETICA_BOLD
            );

            PDPageContentStream cs =
                    new PDPageContentStream(doc, page);

            float y = 750;

            cs.beginText();
            cs.setFont(bold, 16);
            cs.newLineAtOffset(50, y);
            cs.showText("QuizRank - Assignment Result Sheet");
            cs.endText();

            y -= 28;

            cs.beginText();
            cs.setFont(font, 10);
            cs.newLineAtOffset(50, y);

            cs.showText(
                    "Assignment: " + safe(a.getTitle())
                            + " | Due: "
                            + (a.getDueDate() == null
                            ? "N/A"
                            : a.getDueDate())
            );

            cs.endText();

            y -= 28;

            String[] headers = {
                    "SL",
                    "Student",
                    "ID",
                    "Submitted At",
                    "Grade"
            };

            float[] x = {50, 78, 270, 350, 500};

            cs.setFont(bold, 9);

            for (int i = 0; i < headers.length; i++) {

                cs.beginText();
                cs.newLineAtOffset(x[i], y);
                cs.showText(headers[i]);
                cs.endText();
            }

            y -= 18;

            cs.setFont(font, 8);

            for (Map<String, Object> row : rows) {

                if (y < 55) {

                    cs.close();

                    page = new PDPage();

                    doc.addPage(page);

                    cs = new PDPageContentStream(doc, page);

                    y = 750;

                    cs.setFont(font, 8);
                }

                String[] vals = {
                        String.valueOf(row.get("serial")),
                        safe(String.valueOf(row.get("studentName"))),
                        safe(String.valueOf(row.get("userId"))),
                        safe(String.valueOf(row.get("submittedAt"))),
                        safe(String.valueOf(row.get("grade")))
                };

                for (int i = 0; i < vals.length; i++) {

                    cs.beginText();
                    cs.newLineAtOffset(x[i], y);
                    cs.showText(
                            trim(vals[i], i == 1 ? 28 : i == 3 ? 23 : 16)
                    );
                    cs.endText();
                }

                y -= 16;
            }

            cs.close();

            doc.save(bytes);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            ContentDisposition.attachment()
                                    .filename(
                                            "assignment-" + id + "-results.pdf"
                                    )
                                    .build()
                                    .toString()
                    )
                    .body(bytes.toByteArray());
        }
    }

    private String safe(String s) {

        if (s == null) {
            return "";
        }

        StringBuilder b = new StringBuilder();

        for (char ch : s.toCharArray()) {

            b.append(
                    ch >= 32 && ch <= 126 ? ch : '?'
            );
        }

        return b.toString();
    }

    private String trim(String s, int n) {

        return s.length() > n
                ? s.substring(0, n - 3) + "..."
                : s;
    }

    // =====================================================
    // CLASS NOTES
    // =====================================================

    // All class notes
    @GetMapping("/class-notes")
    public List<LearningMaterial> allMaterials() {

        return materials.findAllByOrderByCreatedAtDesc();
    }

    // Teacher class notes
    @GetMapping("/class-notes/teacher/{teacherId}")
    public List<LearningMaterial> teacherMaterials(
            @PathVariable Integer teacherId) {

        requireRole(teacherId, User.Role.TEACHER);

        return materials.findByTeacherIdOrderByCreatedAtDesc(
                teacherId
        );
    }

    // Student class notes
    @GetMapping("/class-notes/student/{studentId}")
    public List<LearningMaterial> studentMaterials(
            @PathVariable Integer studentId) {

        requireRole(studentId, User.Role.STUDENT);

        Set<Integer> enrolled = new HashSet<>();

        courses.findByStudentId(studentId)
                .forEach(c -> enrolled.add(c.getSubjectId()));

        return materials.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(m ->
                        m.getSubjectId() == null ||
                                enrolled.contains(m.getSubjectId())
                )
                .toList();
    }

    // Teacher publishes class note
    @PostMapping(
            value = "/class-notes",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public LearningMaterial createMaterial(
            @RequestParam Integer teacherId,
            @RequestParam(required = false) Integer subjectId,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestPart("file") MultipartFile file) throws Exception {

        requireRole(teacherId, User.Role.TEACHER);

        if (title == null || title.isBlank() || title.length() > 180) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Title is required (max 180 characters)"
            );
        }

        LearningMaterial m = new LearningMaterial();

        m.setTeacherId(teacherId);
        m.setSubjectId(subjectId);
        m.setTitle(title.trim());
        m.setDescription(description);

        m.setFileName(
                file.getOriginalFilename() == null
                        ? "class-note.pdf"
                        : file.getOriginalFilename()
        );

        m.setStoredName(storage.savePdf(file));

        return materials.save(m);
    }

    // Download class note
    @GetMapping("/class-notes/{id}/download")
    public ResponseEntity<Resource> materialDownload(
            @PathVariable Integer id) {

        LearningMaterial m = getMaterial(id);

        return download(
                m.getStoredName(),
                m.getFileName()
        );
    }

    // Delete class note
    @DeleteMapping("/class-notes/{id}")
    public ResponseEntity<Void> deleteMaterial(
            @PathVariable Integer id,
            @RequestParam Integer teacherId) throws Exception {

        LearningMaterial m = getMaterial(id);

        requireRole(teacherId, User.Role.TEACHER);

        if (!m.getTeacherId().equals(teacherId)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN
            );
        }

        storage.delete(m.getStoredName());

        materials.delete(m);

        return ResponseEntity.noContent().build();
    }
}