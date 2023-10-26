import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Student from "Academic/Models/Student";
import CreateStudentValidator from "Academic/Validators/CreateStudentValidator";
import { validate as uuidValidation } from "uuid";
import UpdateStudentValidator from "Academic/Validators/UpdateStudentValidator";
import { statusRoutes } from "App/Modules/Log/lib/enum";
import { CreateRouteHist } from "App/Modules/Log/Helpers/createRouteHist";

export default class StudentsController {
  public async index({ request, response }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const {
      page = 1,
      limit = 10,
      keyword = "",
      mode = "page",
      classId = "",
      isGraduated = false,
      notInSubject = "",
      subjectMember = ""
    } = request.qs();

    if (classId && !uuidValidation(classId)) {
      return response.badRequest({ message: "Class ID tidak valid" });
    }

    if (notInSubject && !uuidValidation(notInSubject)) {
      return response.badRequest({ message: "Subject ID tidak valid" });
    }

    if (subjectMember && !uuidValidation(subjectMember)) {
      return response.badRequest(({message: "Subject ID tidak valid"}))
    }

    const graduated = isGraduated == 'false'? false : true
    
    try {
      let data: object = {};
      if (mode === "page") {
        data = await Student.query()
          .select("*")
          .preload("class", (query) => query.select("name"))
          .preload("kelurahan")
          .preload("kecamatan")
          .preload("kota")
          .preload("provinsi")
          .if(subjectMember, sm => sm.whereHas('extracurricular', ex => ex.where('subjectId', subjectMember)))
          .if(notInSubject, q => q.whereDoesntHave('extracurricular', q => q.where('subjectId', notInSubject)))
          .if(graduated, (g) => g.where("isGraduated", isGraduated))
          .andWhere((q) => {
            q.whereILike("name", `%${keyword}%`);
            q.orWhereILike("nis", `%${keyword}%`);
          })
          .if(classId, (c) => c.where("classId", classId))
          .orderBy("name")
          .paginate(page, limit);
      } else if (mode === "list") {
        data = await Student.query()
          .select("*")
          .preload("class", (query) => query.select("name"))
          .preload("kelurahan")
          .preload("kecamatan")
          .preload("kota")
          .preload("provinsi")
          .if(subjectMember, sm => sm.whereHas('extracurricular', ex => ex.where('subjectId', subjectMember)))
          .if(notInSubject, q => q.whereDoesntHave('extracurricular', q => q.where('subjectId', notInSubject)))
          .if(graduated, (g) => g.where("isGraduated", isGraduated))
          .andWhere((q) => {
            q.whereILike("name", `%${keyword}%`);
            q.orWhereILike("nis", `%${keyword}%`);
          })
          .if(classId, (c) => c.where("classId", classId))
          .orderBy("name");
      } else {
        return response.badRequest({
          message: "Mode tidak dikenali, (pilih: page / list)",
        });
      }

      CreateRouteHist(request, statusRoutes.FINISH)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      console.log(error);
      CreateRouteHist(request, statusRoutes.ERROR, error.message || error)
      response.badRequest({ message: "Gagal mengambil data", error });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const payload = await request.validate(CreateStudentValidator);
    try {
      const data = await Student.create(payload);

      CreateRouteHist(request, statusRoutes.FINISH)
      response.created({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      console.log(error);
      CreateRouteHist(request, statusRoutes.ERROR, error.message || error)
      response.badRequest({
        message: "Gagal menyimpan data",
        error: error.message,
      });
    }
  }

  public async show({ request, params, response }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Student ID tidak valid" });
    }

    try {
      const data = await Student.query()
        .preload("class", (query) => query.select("name"))
        .preload("kelurahan")
        .preload("kecamatan")
        .preload("kota")
        .preload("provinsi")
        .where("id", id)
        .firstOrFail();

        CreateRouteHist(request, statusRoutes.FINISH)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      console.log(error);
      CreateRouteHist(request, statusRoutes.ERROR, error.message || error)
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message,
      });
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Student ID tidak valid" });
    }

    const payload = await request.validate(UpdateStudentValidator);
    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }
    try {
      const student = await Student.findOrFail(id);
      const data = await student.merge(payload).save();
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      console.log(error);
      response.badRequest({
        message: "Gagal mengubah data",
        error: error.message,
      });
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Student ID tidak valid" });
    }

    try {
      const data = await Student.findOrFail(id);
      await data.delete();
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: error.message,
      });
    }
  }
}
