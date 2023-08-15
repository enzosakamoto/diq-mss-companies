import { Company } from '../../models/company'
import { HttpRequest, HttpResponse } from '../protocols'
import {
  CreateCompanyParams,
  ICreateCompanyController,
  ICreateCompanyRepository
} from './protocols'
import validator from 'validator'

export class CreateCompanyController implements ICreateCompanyController {
  constructor(
    private readonly createCompanyRepository: ICreateCompanyRepository
  ) {}
  async handle(
    httpRequest: HttpRequest<CreateCompanyParams>
  ): Promise<HttpResponse<Company>> {
    try {
      const requiredFields = ['name', 'image', 'description', 'link']

      for (const field of requiredFields) {
        if (!httpRequest?.body?.[field as keyof CreateCompanyParams]?.length) {
          return {
            statusCode: 400,
            body: `Field ${field} is required}`
          }
        }
      }

      if (httpRequest.body!.name.length < 4) {
        return {
          statusCode: 400,
          body: 'Name must be at least 4 characters'
        }
      }

      const imageUrlIsValid = validator.isURL(httpRequest.body!.image)

      if (!imageUrlIsValid)
        return {
          statusCode: 400,
          body: 'Image has invalid URL'
        }

      const linkIsValid = validator.isURL(httpRequest.body!.link)

      if (!linkIsValid)
        return {
          statusCode: 400,
          body: 'Link has invalid URL'
        }

      const company = await this.createCompanyRepository.createCompany(
        httpRequest.body!
      )

      return {
        statusCode: 201,
        body: company
      }
    } catch (error) {
      return {
        statusCode: 500,
        body: 'Something went wrong'
      }
    }
  }
}
