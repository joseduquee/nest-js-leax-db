import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
    
    @ApiProperty({
        example: '5',
        description: 'How many items do you need',
    })
    @IsOptional()
    @IsPositive()
    @Min(1)
    @Type(() => Number)
    limit?: number;

    @ApiProperty({
        example: 0,
        description: 'How many item do you want to skip',
    })
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    offset?: number;
}