import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { string } from "@ioc:Adonis/Core/Helpers";
import Env from "@ioc:Adonis/Core/Env";
import Database from "@ioc:Adonis/Lucid/Database";
import CreateUserStudentCandidateValidator from "../../Validators/CreateUserStudentCandidateValidator";
import Mail from '@ioc:Adonis/Addons/Mail';
import jwt_decode from "jwt-decode";
import UserStudentCandidate from '../../Models/UserStudentCandidate';
import USCLoginValidator from '../../Validators/USCLoginValidator';
import GoogleLoginValidator from '../../Validators/GoogleLoginValidator';
import ChangePasswordUSCValidator from '../../Validators/ChangePasswordUSCValidator';
import { validate as uuidValidation } from 'uuid'

export default class UserStudentCandidatesController {
    public async register({ request, response }: HttpContextContract) {
        let payload = await request.validate(CreateUserStudentCandidateValidator)

        const token = string.generateRandom(64)
        const actionUrl = `${Env.get('BE_URL')}/ppdb/auth/verify-email?token=${token}`

        let data: UserStudentCandidate
        try {
            data = await UserStudentCandidate.create({
                ...payload,
                verifyToken: token,
            })
        } catch (error) {
            return response.internalServerError({
                message: "CO-USC-REG_01: Gagal input data user calon siswa baru",
                error: error.message
            })
        }

        try {
            await Mail.send((message) => {
                message
                    .from(Env.get("SMTP_USERNAME"))
                    .to(payload.email)
                    .subject("Register Akun PPDB FG Telah Berhasil")
                    .htmlView("emails/student_candidate_verify_request", { actionUrl })
            })
        } catch (error) {
            return response.send({ message: "CO-USC-REG_02: email tidak valid", error: error.message });
        }

        response.ok({
            message: "Berhasil melakukan register, silahkan verifikasi email anda",
            data,
            actionUrl // TODO: remove after development
        })
    }

    public async login({ request, response, auth }: HttpContextContract) {
        const payload = await request.validate(USCLoginValidator)

        try {
            const token = await auth.use('ppdb_api').attempt(payload.email, payload.password, {
                expiresIn: '24 hours'
            })
            const user = await UserStudentCandidate.query()
                .where("id", auth.use('ppdb_api').user!.id)
                .preload('roles', q => q.select("name", "permissions"))
                .preload('studentCandidate')

            response.ok({
                message: "login successful",
                token,
                data: user
            })
        } catch (error) {
            console.log(error)

            return response.badRequest({
                message: "CO-USC-LOG_01: Invalid credentials",
                error: error.message
            });
        }
    }

    public async logout({ auth, response }: HttpContextContract) {
        await auth.use('ppdb_api').revoke()
        await Database.manager.close("pg")
        response.ok({ message: "Berhasil logout" })
    }

    public async verify({ request, response, view }: HttpContextContract) {
        const token = request.input("token")

        try {
            const usc = await UserStudentCandidate.findByOrFail("verifyToken", token)

            await usc.merge({ verifyToken: "", verified: true }).save()

            const LOGIN_URL = 'https://ian-fitur-fg.netlify.app/ppdb'
            return view.render('ppdb/student_candidate_verification_success', { LOGIN_URL })
        } catch (error) {
            return response.badRequest({
                message: "CO-USC-VER_01: email tidak ditemukan / token tidak cocok",
                error: error.message
            })
        }
    }

    public async loginGoogle({ request, response, auth }: HttpContextContract) {
        interface UserGoogle {
            email: string;
            name: string;
            email_verified: boolean;
        }

        const { cred } = await request.validate(GoogleLoginValidator)
        const userGoogle: UserGoogle = jwt_decode(cred)

        const userDetails = {
            email: userGoogle.email,
            verified: userGoogle.email_verified,
            provider: "google"
        }

        try {
            const user = await UserStudentCandidate.query()
                .where('email', userGoogle.email)
                .preload("roles", (r) => r.select("name", "permissions"))
                .firstOrFail()

            const tokenAuth = await auth.use('ppdb_api').login(user)

            response.ok({ message: "Login berhasil", token: tokenAuth, data: user })
        } catch (error) {
            return response.badRequest({
                message: "CO-USC-GLO_01: Anda belum memiliki akun",
                email: userDetails.email,
                error: error.message
            });
        }
    }

    public async changePassword({ request, response, auth }: HttpContextContract) {
        const payload = await request.validate(ChangePasswordUSCValidator)

        try {
            await auth.use('ppdb_api')
                .verifyCredentials(auth.use('ppdb_api').user!.email, payload.current_password)
        } catch (error) {
            return response.unprocessableEntity({
                message: "CO-USC-CPAS_01: Password lama salah",
                error: error.message,
            })
        }

        try {
            const usc = await UserStudentCandidate.findOrFail(auth.use('ppdb_api').user!.id)
            await usc.merge({ password: payload.new_password }).save()

            response.ok({ message: "Berhasil mengubah password" })
        } catch (error) {
            return response.badRequest({
                message: "CO-USC-CPAS_02: Gagal mengubah password",
                error: error.message
            })
        }
    }

    public async destroy({ params, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "CO-USC-DES_01: ID user calon siswa tidak valid" }) }

        try {
            const data = await UserStudentCandidate.findOrFail(id)
            await data.delete()
            response.ok({ message: "Berhasil menghapus data user calon siswa" })
        } catch (error) {
            console.log(error);
            response.badRequest({ message: "CO-USC-DES_02: Gagal menghapus data user calon siswa", error: error.message })
        }
    }

    // TODO: lanjut fitur ini jika endpoint sudah bisa diakses tanpa verifikasi
    // public async askNewVerification({ response, auth }: HttpContextContract) {
    //     let user_sc
    //     try {
    //         user_sc = await UserStudentCandidate.query()
    //             .where('id', auth.use('ppdb_api').user!.id)
    //             .andWhere('verified', 'false')
    //             .firstOrFail()
    //     } catch (error) {
    //         return response.badRequest({
    //             message: "Error: Anda sudah verifikasi akun",
    //             error: error.message
    //         })
    //     }

    //     const token = string.generateRandom(64)
    //     const actionUrl = `${Env.get('BE_URL')}/ppdb/auth/verify-email?token=${token}`

    //     try {
    //         user_sc.merge({ verifyToken: token })
    //     } catch (error) {
    //         return response.internalServerError({
    //             message: "Gagal update data token verifikasi",
    //             error: error.message
    //         })
    //     }

    //     try {
    //         await Mail.send((message) => {
    //             message
    //                 .from(Env.get("SMTP_USERNAME"))
    //                 .to(auth.use('ppdb_api').user!.email)
    //                 .subject("Permintaan verifikasi akun | SMA FG")
    //                 .htmlView("emails/", { actionUrl })
    //         })
    //     } catch (error) {
    //         return response.badRequest({ message: "email tidak valid" })
    //     }

    //     response.ok({
    //         message: "Permintaan verifikasi berhasil diterima, silahkan verifikasi email anda",
    //         user_sc,
    //         actionUrl // TODO: remove after development
    //     })
    // }
}
